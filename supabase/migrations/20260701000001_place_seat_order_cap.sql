-- place_seat_order RPC에 좌석 수 상한 추가
-- 문제: route 레이어에서 MAX_TICKETS_PER_ORDER(8) 검증을 하지만,
--       인증된 사용자가 RPC를 직접 호출하면 캡을 우회할 수 있었음.
--       SOLD_OUT으로 재고 초과는 막히지만, 재고 이내에서 전량 독점이 가능.
-- 수정: RPC 내부에서도 array_length 상한을 동일하게 적용.
--       route의 MAX_TICKETS_PER_ORDER 상수와 반드시 값을 일치시킬 것.

create or replace function public.place_seat_order(
  p_event_id uuid,
  p_slot_id uuid,
  p_grade_id uuid,
  p_seat_ids uuid[],
  p_total_price int
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
  v_seat_count int;
  v_max_per_order constant int := 8;
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  v_seat_count := coalesce(array_length(p_seat_ids, 1), 0);

  if v_seat_count = 0 then
    raise exception 'INVALID_SEATS';
  end if;

  if v_seat_count > v_max_per_order then
    raise exception 'TOO_MANY_SEATS';
  end if;

  -- place_order와 동일하게 ticket_grade.quantity도 같이 차감해서
  -- "잔여 좌석수" 표시(BookingPanel)와 취소 시 복구 로직(cancel_order/cancel_stale_orders)을
  -- 좌석 기반 주문과 동일하게 맞춘다.
  update ticket_grade
     set quantity = quantity - v_seat_count
   where grade_id = p_grade_id
     and event_id = p_event_id
     and quantity >= v_seat_count;

  if not found then
    raise exception 'SOLD_OUT';
  end if;

  insert into orders (
    event_id, slot_id, ticket_grade_id, quantity, total_price, status, user_id
  ) values (
    p_event_id, p_slot_id, p_grade_id, v_seat_count, p_total_price, 'ordered', v_uid
  )
  returning order_id into v_order_id;

  -- 선택한 좌석들을 한 번에 INSERT. 이미 누가 잡은 좌석이 섞여 있으면
  -- (seat_id, slot_id) PK 충돌로 INSERT 전체가 실패 -> SEAT_TAKEN으로 매핑.
  begin
    insert into order_seat (seat_id, slot_id, order_id, status, held_until)
    select s, p_slot_id, v_order_id, 'held', now() + interval '15 minutes'
    from unnest(p_seat_ids) as s;
  exception when unique_violation then
    raise exception 'SEAT_TAKEN';
  end;

  return v_order_id;
end;
$$;

grant execute on function public.place_seat_order(uuid, uuid, uuid, uuid[], int) to authenticated;
