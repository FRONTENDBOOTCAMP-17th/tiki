-- 티켓 공유 기능: ticket_share 테이블 + RLS + RPC
-- (공유하기 / 공유한 티켓 / 받은 티켓)

-- ============================================================
-- ticket_share 테이블
-- ============================================================
create table if not exists public.ticket_share (
  share_id     uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(order_id) on delete cascade,
  sharer_id    uuid not null references public.users(id) on delete cascade,
  shared_with  uuid not null references public.users(id) on delete cascade,
  quantity     int  not null check (quantity >= 1),
  created_at   timestamptz not null default now(),
  check (sharer_id <> shared_with)
);

alter table public.ticket_share enable row level security;

-- 조회: 내가 준 것(sharer) 또는 받은 것(shared_with)만
-- insert/delete는 RPC(security definer)로만 처리 → 직접 정책 없음
create policy "ticket_share select own"
  on public.ticket_share for select to authenticated
  using (auth.uid() = sharer_id or auth.uid() = shared_with);

-- ============================================================
-- RPC: 티켓 공유하기 (친구 검증 + 매수 누적 검증 + 알림)
-- ============================================================
create or replace function public.share_ticket(
  p_order_id uuid,
  p_shared_with uuid,
  p_quantity int
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_order_qty int;
  v_already int;
  v_is_friend int;
  v_my_name text;
  v_title text;
begin
  if v_me is null then
    return json_build_object('error', '로그인이 필요합니다');
  end if;

  if p_quantity < 1 then
    return json_build_object('error', '공유 수량이 올바르지 않습니다');
  end if;

  -- 1) 내 주문(결제완료)인지 + 총 수량
  select quantity into v_order_qty
  from public.orders
  where order_id = p_order_id and user_id = v_me and status = 'paid';

  if v_order_qty is null then
    return json_build_object('error', '공유할 수 없는 예매입니다');
  end if;

  -- 2) 받는 사람이 내 친구(accepted)인지
  select count(*) into v_is_friend
  from public.friend
  where status = 'accepted'
    and (
      (requester_id = v_me and addressee_id = p_shared_with) or
      (requester_id = p_shared_with and addressee_id = v_me)
    );

  if v_is_friend = 0 then
    return json_build_object('error', '친구에게만 공유할 수 있습니다');
  end if;

  -- 3) 이미 이 주문으로 공유한 합계
  select coalesce(sum(quantity), 0) into v_already
  from public.ticket_share
  where order_id = p_order_id and sharer_id = v_me;

  -- 본인 1매 보유 → 공유 가능 최대 = 총수량 - 1
  if v_already + p_quantity > v_order_qty - 1 then
    return json_build_object(
      'error',
      '공유 가능한 티켓 수를 초과했습니다 (최소 1매는 본인 보유)'
    );
  end if;

  -- 4) 공유 기록 생성
  insert into public.ticket_share (order_id, sharer_id, shared_with, quantity)
  values (p_order_id, v_me, p_shared_with, p_quantity);

  -- 5) 받는 친구에게 알림
  select name into v_my_name from public.users where id = v_me;
  select e.title into v_title
  from public.orders o join public.event e on e.event_id = o.event_id
  where o.order_id = p_order_id;

  insert into public.notification (user_id, type, title, link, ref_id)
  values (
    p_shared_with,
    'order',
    coalesce(v_my_name, '회원') || '님이 ' || coalesce(v_title, '공연') || ' 티켓을 공유했습니다',
    '/mypage/friends',
    p_order_id
  );

  return json_build_object('success', true);
end;
$$;

revoke all on function public.share_ticket(uuid, uuid, int) from public;
grant execute on function public.share_ticket(uuid, uuid, int) to authenticated;

-- ============================================================
-- RPC: 내가 공유한 티켓 목록
-- ============================================================
create or replace function public.get_my_shared_tickets()
returns table (
  share_id         uuid,
  event_title      text,
  slot_date        date,
  slot_time        text,
  shared_with_name text,
  quantity         int,
  created_at       timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    ts.share_id,
    e.title as event_title,
    s.date as slot_date,
    s.start_time::text as slot_time,
    u.name as shared_with_name,
    ts.quantity,
    ts.created_at
  from public.ticket_share ts
  join public.orders o on o.order_id = ts.order_id
  join public.event e on e.event_id = o.event_id
  left join public.slot s on s.slot_id = o.slot_id
  join public.users u on u.id = ts.shared_with
  where ts.sharer_id = auth.uid()
  order by ts.created_at desc;
$$;

revoke all on function public.get_my_shared_tickets() from public;
grant execute on function public.get_my_shared_tickets() to authenticated;

-- ============================================================
-- RPC: 내가 받은 티켓 목록
-- ============================================================
create or replace function public.get_my_received_tickets()
returns table (
  share_id        uuid,
  order_id        uuid,
  event_title     text,
  venue_name      text,
  venue_address   text,
  slot_date       date,
  slot_time       text,
  grade_name      text,
  sharer_name     text,
  quantity        int,
  created_at      timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    ts.share_id,
    ts.order_id,
    e.title as event_title,
    e.venue_name,
    e.venue_address,
    s.date as slot_date,
    s.start_time::text as slot_time,
    g.grade_name,
    u.name as sharer_name,
    ts.quantity,
    ts.created_at
  from public.ticket_share ts
  join public.orders o on o.order_id = ts.order_id
  join public.event e on e.event_id = o.event_id
  left join public.slot s on s.slot_id = o.slot_id
  left join public.ticket_grade g on g.grade_id = o.ticket_grade_id
  join public.users u on u.id = ts.sharer_id
  where ts.shared_with = auth.uid()
  order by ts.created_at desc;
$$;

revoke all on function public.get_my_received_tickets() from public;
grant execute on function public.get_my_received_tickets() to authenticated;
