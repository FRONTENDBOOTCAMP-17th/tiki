-- 1) users.role에 'staff' 추가
alter table public.users drop constraint users_role_check;
alter table public.users add constraint users_role_check
  check (role = any (array['buyer'::text, 'seller'::text, 'admin'::text, 'staff'::text]));

-- 2) 스태프 배정 테이블 (초대 수락형)
create table public.event_staff (
  staff_id   uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.event(event_id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  invited_by uuid not null references public.users(id),
  status     text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  constraint event_staff_unique unique (event_id, user_id)
);

comment on table public.event_staff is '공연별 스태프 배정. 판매자가 초대하고 대상 유저가 수락하면 해당 공연 체크인 권한 획득';

alter table public.event_staff enable row level security;
-- 정책 없음: SECURITY DEFINER RPC로만 접근

-- 3) 스태프 초대
create or replace function public.invite_event_staff(p_event_id uuid, p_email text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_caller   uuid := auth.uid();
  v_event    record;
  v_target   record;
  v_existing event_staff%rowtype;
  v_staff_id uuid;
begin
  if v_caller is null then return jsonb_build_object('code', 'unauthorized'); end if;

  select event_id, title, seller_id into v_event from event where event_id = p_event_id;
  if not found then return jsonb_build_object('code', 'event_not_found'); end if;
  if v_event.seller_id <> v_caller::text then return jsonb_build_object('code', 'forbidden'); end if;

  select id, name, role into v_target from users where lower(email) = lower(trim(p_email));
  if not found then return jsonb_build_object('code', 'user_not_found'); end if;
  if v_target.id = v_caller then return jsonb_build_object('code', 'self_invite'); end if;
  if v_target.role not in ('buyer', 'staff') then
    return jsonb_build_object('code', 'invalid_role', 'role', v_target.role);
  end if;

  select * into v_existing from event_staff
  where event_id = p_event_id and user_id = v_target.id;

  if found then
    if v_existing.status = 'rejected' then
      -- 거절했던 사람 재초대 허용
      update event_staff set status = 'pending', created_at = now()
      where staff_id = v_existing.staff_id;
      v_staff_id := v_existing.staff_id;
    else
      return jsonb_build_object('code', 'already_exists', 'status', v_existing.status);
    end if;
  else
    insert into event_staff (event_id, user_id, invited_by)
    values (p_event_id, v_target.id, v_caller)
    returning staff_id into v_staff_id;
  end if;

  insert into notification (user_id, title, type, link, ref_id)
  values (v_target.id, '『' || v_event.title || '』 공연 스태프로 초대되었습니다', 'staff', '/staff', v_staff_id);

  return jsonb_build_object('code', 'ok', 'staff_id', v_staff_id, 'name', v_target.name);
end; $$;

-- 4) 초대 수락 (수락 시 buyer → staff 전환)
create or replace function public.accept_staff_invite(p_staff_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_row   event_staff%rowtype;
  v_role  text;
  v_title text;
begin
  if auth.uid() is null then return jsonb_build_object('code', 'unauthorized'); end if;

  select * into v_row from event_staff where staff_id = p_staff_id;
  if not found then return jsonb_build_object('code', 'not_found'); end if;
  if v_row.user_id <> auth.uid() then return jsonb_build_object('code', 'forbidden'); end if;
  if v_row.status <> 'pending' then
    return jsonb_build_object('code', 'already_handled', 'status', v_row.status);
  end if;

  update event_staff set status = 'accepted' where staff_id = p_staff_id;

  select role into v_role from users where id = v_row.user_id;
  if v_role = 'buyer' then
    update users set role = 'staff' where id = v_row.user_id;
  end if;

  select title into v_title from event where event_id = v_row.event_id;
  insert into notification (user_id, title, type, link, ref_id)
  values (v_row.invited_by, '『' || v_title || '』 스태프 초대가 수락되었습니다', 'staff', '/seller/staff', p_staff_id);

  return jsonb_build_object('code', 'ok');
end; $$;

-- 5) 초대 거절
create or replace function public.reject_staff_invite(p_staff_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_row   event_staff%rowtype;
  v_title text;
begin
  if auth.uid() is null then return jsonb_build_object('code', 'unauthorized'); end if;

  select * into v_row from event_staff where staff_id = p_staff_id;
  if not found then return jsonb_build_object('code', 'not_found'); end if;
  if v_row.user_id <> auth.uid() then return jsonb_build_object('code', 'forbidden'); end if;
  if v_row.status <> 'pending' then
    return jsonb_build_object('code', 'already_handled', 'status', v_row.status);
  end if;

  update event_staff set status = 'rejected' where staff_id = p_staff_id;

  select title into v_title from event where event_id = v_row.event_id;
  insert into notification (user_id, title, type, link, ref_id)
  values (v_row.invited_by, '『' || v_title || '』 스태프 초대가 거절되었습니다', 'staff', '/seller/staff', p_staff_id);

  return jsonb_build_object('code', 'ok');
end; $$;

-- 6) 배정 해제 (판매자/관리자, 남은 배정 없으면 buyer 복귀)
create or replace function public.remove_event_staff(p_staff_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_caller uuid := auth.uid();
  v_role   text;
  v_row    event_staff%rowtype;
begin
  if v_caller is null then return jsonb_build_object('code', 'unauthorized'); end if;

  select * into v_row from event_staff where staff_id = p_staff_id;
  if not found then return jsonb_build_object('code', 'not_found'); end if;

  select role into v_role from users where id = v_caller;
  if v_row.invited_by <> v_caller and v_role <> 'admin' then
    return jsonb_build_object('code', 'forbidden');
  end if;

  delete from event_staff where staff_id = p_staff_id;

  -- 남은 배정(대기/수락 불문)이 하나도 없으면 구매자로 복귀
  if not exists (select 1 from event_staff where user_id = v_row.user_id) then
    update users set role = 'buyer' where id = v_row.user_id and role = 'staff';
  end if;

  return jsonb_build_object('code', 'ok');
end; $$;

-- 7) 스태프 홈: 내 배정/초대 목록
create or replace function public.get_my_staff_events()
returns table (
  staff_id    uuid,
  event_id    uuid,
  title       text,
  venue_name  text,
  start_date  date,
  end_date    date,
  thumbnail   text,
  status      text,
  seller_name text
) language sql security definer set search_path = public as $$
  select es.staff_id, e.event_id, e.title, e.venue_name, e.start_date, e.end_date,
         e.thumbnail, es.status, u.name as seller_name
  from event_staff es
  join event e on e.event_id = es.event_id
  join users u on u.id = es.invited_by
  where es.user_id = auth.uid() and es.status in ('pending', 'accepted')
  order by case es.status when 'pending' then 0 else 1 end, es.created_at desc;
$$;

-- 8) 판매자용: 내 공연들의 스태프 현황
create or replace function public.get_event_staff_overview()
returns table (
  staff_id    uuid,
  event_id    uuid,
  event_title text,
  staff_name  text,
  staff_email text,
  status      text,
  created_at  timestamptz
) language sql security definer set search_path = public as $$
  select es.staff_id, e.event_id, e.title, u.name, u.email, es.status, es.created_at
  from event_staff es
  join event e on e.event_id = es.event_id
  join users u on u.id = es.user_id
  where e.seller_id = auth.uid()::text
  order by es.created_at desc;
$$;

-- 9) checkin_ticket 권한 확장: staff는 배정(accepted)된 공연만
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
  if v_staff_id is null then
    return jsonb_build_object('code', 'unauthorized');
  end if;

  select role into v_staff_role from users where id = v_staff_id;
  if v_staff_role is null or v_staff_role not in ('seller', 'admin', 'staff') then
    return jsonb_build_object('code', 'forbidden');
  end if;

  if p_subject_type not in ('order', 'share') then
    return jsonb_build_object('code', 'not_found');
  end if;

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

  select
    o.event_id      as event_id,
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

  -- 셀러: 자기 이벤트만 / 스태프: 배정(accepted)된 이벤트만 / admin: 전체
  if v_staff_role = 'seller' and v_info.event_seller_id <> v_staff_id::text then
    return jsonb_build_object('code', 'forbidden');
  end if;
  if v_staff_role = 'staff' and not exists (
    select 1 from event_staff
    where event_id = v_info.event_id and user_id = v_staff_id and status = 'accepted'
  ) then
    return jsonb_build_object('code', 'forbidden');
  end if;

  if v_info.order_status <> 'paid' then
    return jsonb_build_object('code', 'not_paid', 'order_status', v_info.order_status);
  end if;

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

  insert into ticket_checkin (subject_type, subject_id, order_id, checked_in_by)
  values (p_subject_type, p_subject_id, v_order_id, v_staff_id)
  on conflict on constraint ticket_checkin_subject_unique do nothing
  returning checkin_id into v_checkin_id;

  if v_checkin_id is null then
    select checked_in_at into v_existing_at
    from ticket_checkin
    where subject_type = p_subject_type and subject_id = p_subject_id;
    return jsonb_build_object('code', 'already_used', 'checked_in_at', v_existing_at);
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

-- 권한
revoke execute on function public.invite_event_staff(uuid, text) from public, anon;
revoke execute on function public.accept_staff_invite(uuid) from public, anon;
revoke execute on function public.reject_staff_invite(uuid) from public, anon;
revoke execute on function public.remove_event_staff(uuid) from public, anon;
revoke execute on function public.get_my_staff_events() from public, anon;
revoke execute on function public.get_event_staff_overview() from public, anon;
grant execute on function public.invite_event_staff(uuid, text) to authenticated;
grant execute on function public.accept_staff_invite(uuid) to authenticated;
grant execute on function public.reject_staff_invite(uuid) to authenticated;
grant execute on function public.remove_event_staff(uuid) to authenticated;
grant execute on function public.get_my_staff_events() to authenticated;
grant execute on function public.get_event_staff_overview() to authenticated;