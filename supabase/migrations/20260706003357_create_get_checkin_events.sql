-- 피드백 1: 공용 QR 검증 화면용 — 내가 검증 가능한 공연 목록
-- 셀러(본인 등록 공연) + 배정 스태프(accepted) 통합. checkin_ticket 권한과 동일 기준
create or replace function public.get_checkin_events()
returns table (
  event_id uuid,
  title text,
  venue_name text,
  thumbnail text,
  my_role text
)
language sql
stable security definer
set search_path to 'public'
as $function$
  select e.event_id, e.title, e.venue_name, e.thumbnail, 'seller'::text as my_role
  from public.event e
  where e.seller_id = auth.uid()::text
  union
  select e.event_id, e.title, e.venue_name, e.thumbnail, 'staff'::text as my_role
  from public.event_staff es
  join public.event e on e.event_id = es.event_id
  where es.user_id = auth.uid() and es.status = 'accepted';
$function$;

create or replace function public.can_checkin_event(p_event_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.event e
    where e.event_id = p_event_id and e.seller_id = auth.uid()::text
  ) or exists (
    select 1 from public.event_staff es
    where es.event_id = p_event_id and es.user_id = auth.uid() and es.status = 'accepted'
  );
$function$;
