-- 좌석 단위 예매 RPC 추가 + 기존 취소 RPC들이 좌석도 같이 해제하도록 확장

-- ============================================================
-- 좌석을 선택해서 예매 (place_order와 별개 경로: 좌석 배치도가 있는 이벤트용)
-- ============================================================
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
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;
  if coalesce(array_length(p_seat_ids, 1), 0) = 0 then
    raise exception 'INVALID_SEATS';
  end if;

  -- place_order와 동일하게 ticket_grade.quantity도 같이 차감해서
  -- "잔여 좌석수" 표시(BookingPanel)와 취소 시 복구 로직(cancel_order/cancel_stale_orders)을
  -- 좌석 기반 주문과 동일하게 맞춘다.
  update ticket_grade
     set quantity = quantity - array_length(p_seat_ids, 1)
   where grade_id = p_grade_id
     and event_id = p_event_id
     and quantity >= array_length(p_seat_ids, 1);

  if not found then
    raise exception 'SOLD_OUT';
  end if;

  insert into orders (
    event_id, slot_id, ticket_grade_id, quantity, total_price, status, user_id
  ) values (
    p_event_id, p_slot_id, p_grade_id, array_length(p_seat_ids, 1), p_total_price, 'ordered', v_uid
  )
  returning order_id into v_order_id;

  -- 선택한 좌석들을 한 번에 INSERT. 이미 누가 잡은 좌석이 섞여 있으면
  -- (seat_id, slot_id) PK 충돌로 INSERT 전체가 실패 -> SEAT_TAKEN으로 매핑.
  -- 별도 SELECT ... FOR UPDATE 락이 필요 없는 이유.
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

-- ============================================================
-- cancel_order 확장: 취소 시 점유했던 좌석도 같이 해제(행 삭제)
-- ============================================================
create or replace function public.cancel_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_grade uuid;
  v_qty int;
begin
  if v_uid is null then
    return false;
  end if;

  update orders o
     set status = 'cancelled'
   where o.order_id = p_order_id
     and o.status <> 'cancelled'
     and (
       o.user_id = v_uid
       or exists (
         select 1 from event e
         where e.event_id = o.event_id and e.seller_id = v_uid::text
       )
     )
  returning o.ticket_grade_id, o.quantity into v_grade, v_qty;

  if not found then
    return false;
  end if;

  delete from review where order_id = p_order_id;
  delete from order_seat where order_id = p_order_id;
  -- 좌석 단위 주문(ticket_grade_id가 없거나 좌석 배치도 이벤트)은 quantity 복구 대상이 아닐 수 있으므로
  -- grade_id가 있을 때만 복구 (좌석 기반 예매도 등급별 잔여수량 표시를 같이 쓰는 경우 대비)
  if v_grade is not null then
    update ticket_grade set quantity = quantity + v_qty where grade_id = v_grade;
  end if;
  return true;
end;
$$;

grant execute on function public.cancel_order(uuid) to authenticated;

-- ============================================================
-- cancel_stale_orders 확장: TTL 만료로 취소되는 주문의 좌석도 같이 해제
-- ============================================================
create or replace function public.cancel_stale_orders(p_ttl_minutes int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  with stale as (
    update orders o
       set status = 'cancelled'
     where o.status = 'ordered'
       and o.created_at < now() - (p_ttl_minutes || ' minutes')::interval
    returning o.order_id, o.ticket_grade_id, o.quantity
  ),
  to_restock as (
    select ticket_grade_id, sum(quantity) as qty
    from stale
    where ticket_grade_id is not null
    group by ticket_grade_id
  ),
  restocked as (
    update ticket_grade tg
       set quantity = tg.quantity + r.qty
      from to_restock r
     where tg.grade_id = r.ticket_grade_id
    returning 1
  ),
  released_seats as (
    delete from order_seat
     where order_id in (select order_id from stale)
    returning 1
  )
  select count(*) into v_count from stale;

  return v_count;
end;
$$;
