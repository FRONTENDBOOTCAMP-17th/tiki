-- 1) 입장 기록 테이블
create table public.ticket_checkin (
  checkin_id    uuid primary key default gen_random_uuid(),
  subject_type  text not null check (subject_type in ('order', 'share')),
  subject_id    uuid not null,
  order_id      uuid not null references public.orders(order_id) on delete cascade,
  checked_in_by uuid not null references public.users(id),
  checked_in_at timestamptz not null default now(),
  constraint ticket_checkin_subject_unique unique (subject_type, subject_id)
);

comment on table public.ticket_checkin is '티켓 입장 기록. subject_type=order는 주문자 본인 보유분, share는 공유받은 티켓 단위';

alter table public.ticket_checkin enable row level security;
-- 정책 없음: SECURITY DEFINER RPC로만 접근

-- 2) 입장 검증 + 체크인 RPC
create or replace function public.checkin_ticket(
  p_subject_type text,
  p_subject_id   uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff_id    uuid := auth.uid();
  v_staff_role  text;
  v_share       ticket_share%rowtype;
  v_order_id    uuid;
  v_qty         int;
  v_holder      text;
  v_info        record;
  v_shared_qty  int;
  v_checkin_id  uuid;
  v_existing_at timestamptz;
begin
  -- 인증/권한
  if v_staff_id is null then
    return jsonb_build_object('code', 'unauthorized');
  end if;

  select role into v_staff_role from users where id = v_staff_id;
  if v_staff_role is null or v_staff_role not in ('seller', 'admin') then
    return jsonb_build_object('code', 'forbidden');
  end if;

  if p_subject_type not in ('order', 'share') then
    return jsonb_build_object('code', 'not_found');
  end if;

  -- 공유 티켓이면 share 상태 확인 후 원 주문으로 연결
  if p_subject_type = 'share' then
    select * into v_share from ticket_share where share_id = p_subject_id;
    if not found then
      return jsonb_build_object('code', 'not_found');
    end if;
    if v_share.status <> 'accepted' then
      return jsonb_build_object('code', 'share_invalid', 'share_status', v_share.status);
    end if;
    v_order_id := v_share.order_id;
    v_qty := v_share.quantity;
    select name into v_holder from users where id = v_share.shared_with;
  else
    v_order_id := p_subject_id;
  end if;

  -- 주문 + 이벤트 + 슬롯 + 등급 조회
  select
    o.status        as order_status,
    o.quantity      as order_quantity,
    o.user_id       as order_user_id,
    e.title         as event_title,
    e.seller_id     as event_seller_id,
    s.date          as slot_date,
    s.start_time    as slot_start_time,
    g.grade_name    as grade_name
  into v_info
  from orders o
  join event e on e.event_id = o.event_id
  left join slot s on s.slot_id = o.slot_id
  left join ticket_grade g on g.grade_id = o.ticket_grade_id
  where o.order_id = v_order_id;

  if not found then
    return jsonb_build_object('code', 'not_found');
  end if;

  -- 셀러는 자기 이벤트만 검증 가능 (admin은 전체)
  if v_staff_role = 'seller' and v_info.event_seller_id <> v_staff_id::text then
    return jsonb_build_object('code', 'forbidden');
  end if;

  -- paid만 입장 허용
  if v_info.order_status <> 'paid' then
    return jsonb_build_object('code', 'not_paid', 'order_status', v_info.order_status);
  end if;

  -- 주문자 본인 QR: 보유분 = 주문 수량 − accepted 공유분
  if p_subject_type = 'order' then
    select coalesce(sum(quantity), 0) into v_shared_qty
    from ticket_share
    where order_id = v_order_id and status = 'accepted';

    v_qty := v_info.order_quantity - v_shared_qty;
    if v_qty <= 0 then
      return jsonb_build_object('code', 'fully_shared');
    end if;
    select name into v_holder from users where id = v_info.order_user_id;
  end if;

  -- 원자적 체크인: 유니크 제약 + ON CONFLICT → 동시 스캔 시 한 쪽만 성공
  insert into ticket_checkin (subject_type, subject_id, order_id, checked_in_by)
  values (p_subject_type, p_subject_id, v_order_id, v_staff_id)
  on conflict on constraint ticket_checkin_subject_unique do nothing
  returning checkin_id into v_checkin_id;

  if v_checkin_id is null then
    select checked_in_at into v_existing_at
    from ticket_checkin
    where subject_type = p_subject_type and subject_id = p_subject_id;
    return jsonb_build_object(
      'code', 'already_used',
      'checked_in_at', v_existing_at
    );
  end if;

  return jsonb_build_object(
    'code',        'ok',
    'event_title', v_info.event_title,
    'slot_date',   v_info.slot_date,
    'slot_time',   v_info.slot_start_time,
    'grade_name',  v_info.grade_name,
    'holder_name', v_holder,
    'quantity',    v_qty,
    'subject_type', p_subject_type
  );
end;
$$;

revoke execute on function public.checkin_ticket(text, uuid) from public, anon;
grant execute on function public.checkin_ticket(text, uuid) to authenticated;