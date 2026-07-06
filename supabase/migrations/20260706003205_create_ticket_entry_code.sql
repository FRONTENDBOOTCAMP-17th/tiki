-- 피드백 2: 긴 QR 토큰 수기입력 대안 — 8자리 짧은 입장 코드
-- QR 스캔과 병행. 보안 최종 방어는 기존 checkin_ticket RPC가 담당(코드는 조회용 별칭)

create table if not exists public.ticket_entry_code (
  code text primary key,
  subject_type text not null check (subject_type in ('order','share')),
  subject_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (subject_type, subject_id)
);

alter table public.ticket_entry_code enable row level security;
-- 쓰기/읽기 모두 SECURITY DEFINER RPC 전용 (직접 접근 정책 없음 = deny)

create or replace function public.issue_entry_code(
  p_subject_type text,
  p_subject_id uuid,
  p_ttl_seconds int default 300
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_alphabet text := '3479ACDEFHJKLMNPRTUVWXY';  -- 0,1,2,5,6,8,B,G,I,O,Q,S,Z 제외
  v_code text;
  v_i int;
  v_exp timestamptz := now() + make_interval(secs => p_ttl_seconds);
begin
  if p_subject_type not in ('order','share') then
    raise exception 'invalid subject_type';
  end if;

  loop
    v_code := '';
    for v_i in 1..8 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.ticket_entry_code where code = v_code);
  end loop;

  insert into public.ticket_entry_code (code, subject_type, subject_id, expires_at)
  values (v_code, p_subject_type, p_subject_id, v_exp)
  on conflict (subject_type, subject_id)
  do update set code = excluded.code, expires_at = excluded.expires_at, created_at = now();

  select code into v_code from public.ticket_entry_code
  where subject_type = p_subject_type and subject_id = p_subject_id;

  return v_code;
end;
$function$;

create or replace function public.resolve_entry_code(p_code text)
returns table (subject_type text, subject_id uuid)
language sql
security definer
set search_path to 'public'
as $function$
  select subject_type, subject_id
  from public.ticket_entry_code
  where code = upper(trim(p_code))
    and expires_at >= now();
$function$;
