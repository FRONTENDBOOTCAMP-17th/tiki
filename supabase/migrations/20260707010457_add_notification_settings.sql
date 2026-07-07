-- 알림 설정 저장 자리 (토글이 더미값이라 저장이 안 되던 문제 해결)
alter table public.users
  add column if not exists notification_settings jsonb
  not null default '{"friend": true, "event": true, "marketing": false}'::jsonb;

create or replace function public.update_notification_settings(p_settings jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_me uuid := auth.uid();
  v_result jsonb;
begin
  if v_me is null then
    raise exception 'unauthorized';
  end if;

  update public.users
  set notification_settings = jsonb_build_object(
    'friend', coalesce((p_settings->>'friend')::boolean, (notification_settings->>'friend')::boolean),
    'event', coalesce((p_settings->>'event')::boolean, (notification_settings->>'event')::boolean),
    'marketing', coalesce((p_settings->>'marketing')::boolean, (notification_settings->>'marketing')::boolean)
  )
  where id = v_me
  returning notification_settings into v_result;

  return v_result;
end;
$function$;
