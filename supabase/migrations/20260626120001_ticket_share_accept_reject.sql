-- 1) status 컬럼
alter table public.ticket_share
  add column status text not null default 'pending';
alter table public.ticket_share
  add constraint ticket_share_status_check
  check (status in ('pending', 'accepted', 'rejected'));
-- 기존 공유분은 이미 노출돼 있었으므로 accepted 백필
update public.ticket_share set status = 'accepted';

-- 2) share_ticket: pending 생성 + 거절분 제외 + 알림 변경
create or replace function public.share_ticket(p_order_id uuid, p_shared_with uuid, p_quantity integer)
 returns json language plpgsql security definer set search_path to 'public'
as $$
declare
  v_me uuid := auth.uid();
  v_order_qty int; v_already int; v_is_friend int;
  v_my_name text; v_title text; v_share_id uuid;
begin
  if v_me is null then return json_build_object('error','로그인이 필요합니다'); end if;
  if p_quantity < 1 then return json_build_object('error','공유 수량이 올바르지 않습니다'); end if;

  select quantity into v_order_qty from public.orders
  where order_id = p_order_id and user_id = v_me and status = 'paid';
  if v_order_qty is null then return json_build_object('error','공유할 수 없는 예매입니다'); end if;

  select count(*) into v_is_friend from public.friend
  where status = 'accepted'
    and ((requester_id = v_me and addressee_id = p_shared_with)
      or (requester_id = p_shared_with and addressee_id = v_me));
  if v_is_friend = 0 then return json_build_object('error','친구에게만 공유할 수 있습니다'); end if;

  select coalesce(sum(quantity),0) into v_already from public.ticket_share
  where order_id = p_order_id and sharer_id = v_me and status in ('pending','accepted');

  if v_already + p_quantity > v_order_qty - 1 then
    return json_build_object('error','공유 가능한 티켓 수를 초과했습니다 (최소 1매는 본인 보유)');
  end if;

  insert into public.ticket_share (order_id, sharer_id, shared_with, quantity, status)
  values (p_order_id, v_me, p_shared_with, p_quantity, 'pending')
  returning share_id into v_share_id;

  select name into v_my_name from public.users where id = v_me;
  select e.title into v_title from public.orders o
  join public.event e on e.event_id = o.event_id where o.order_id = p_order_id;

  insert into public.notification (user_id, type, title, link, ref_id)
  values (p_shared_with, 'ticket_share',
    coalesce(v_my_name,'회원') || '님이 ' || coalesce(v_title,'공연') || ' 티켓을 공유했습니다',
    '/mypage/reservations?filter=shared', v_share_id);

  return json_build_object('success', true);
end; $$;

-- 3) 수락 (+ 보낸 사람에게 알림)
create or replace function public.accept_ticket_share(p_share_id uuid)
 returns json language plpgsql security definer set search_path to 'public'
as $$
declare
  v_me uuid := auth.uid();
  v_sharer uuid; v_my_name text;
begin
  if v_me is null then return json_build_object('error','로그인이 필요합니다'); end if;

  update public.ticket_share set status = 'accepted'
  where share_id = p_share_id and shared_with = v_me and status = 'pending'
  returning sharer_id into v_sharer;
  if v_sharer is null then return json_build_object('error','처리할 수 없는 공유입니다'); end if;

  delete from public.notification
  where ref_id = p_share_id and type = 'ticket_share' and user_id = v_me;

  select name into v_my_name from public.users where id = v_me;
  insert into public.notification (user_id, type, title, link, ref_id)
  values (v_sharer, 'order',
    coalesce(v_my_name,'회원') || '님이 공유한 티켓을 수락했습니다',
    '/mypage/reservations?filter=shared', p_share_id);

  return json_build_object('success', true);
end; $$;

-- 4) 거절 (상태만 변경 → 수량 복구 + 보낸 사람에게 알림)
create or replace function public.reject_ticket_share(p_share_id uuid)
 returns json language plpgsql security definer set search_path to 'public'
as $$
declare
  v_me uuid := auth.uid();
  v_sharer uuid; v_my_name text;
begin
  if v_me is null then return json_build_object('error','로그인이 필요합니다'); end if;

  update public.ticket_share set status = 'rejected'
  where share_id = p_share_id and shared_with = v_me and status = 'pending'
  returning sharer_id into v_sharer;
  if v_sharer is null then return json_build_object('error','처리할 수 없는 공유입니다'); end if;

  delete from public.notification
  where ref_id = p_share_id and type = 'ticket_share' and user_id = v_me;

  select name into v_my_name from public.users where id = v_me;
  insert into public.notification (user_id, type, title, link, ref_id)
  values (v_sharer, 'order',
    coalesce(v_my_name,'회원') || '님이 공유한 티켓을 거절했습니다',
    '/mypage/reservations?filter=shared', p_share_id);

  return json_build_object('success', true);
end; $$;

-- 5) 받은 티켓: 수락된 것만
create or replace function public.get_my_received_tickets()
 returns table(share_id uuid, order_id uuid, event_title text, venue_name text,
   venue_address text, slot_date date, slot_time text, grade_name text,
   sharer_name text, quantity integer, created_at timestamp with time zone)
 language sql security definer set search_path to 'public'
as $$
  select ts.share_id, ts.order_id, e.title, e.venue_name, e.venue_address,
    s.date, s.start_time::text, g.grade_name, u.name, ts.quantity, ts.created_at
  from public.ticket_share ts
  join public.orders o on o.order_id = ts.order_id
  join public.event e on e.event_id = o.event_id
  left join public.slot s on s.slot_id = o.slot_id
  left join public.ticket_grade g on g.grade_id = o.ticket_grade_id
  join public.users u on u.id = ts.sharer_id
  where ts.shared_with = auth.uid() and ts.status = 'accepted'
  order by ts.created_at desc;
$$;
