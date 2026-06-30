-- 문의 답변 완료 시 작성자에게 알림을 발송하는 함수
-- SECURITY DEFINER로 RLS를 우회하되, 호출자가 관리자인지 함수 내부에서 검증
create or replace function public.notify_inquiry_answered(p_inquiry_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_title   text;
begin
  -- 호출자가 관리자인지 검증
  if not exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception '관리자만 호출할 수 있습니다';
  end if;

  -- 문의 작성자 조회
  select user_id, title into v_user_id, v_title
  from public.inquiry
  where inquiry_id = p_inquiry_id;

  if v_user_id is null then
    raise exception '문의를 찾을 수 없습니다';
  end if;

  -- 작성자에게 알림 insert
  insert into public.notification (user_id, type, title, link, ref_id)
  values (
    v_user_id,
    'inquiry',
    '문의하신 "' || v_title || '"에 답변이 등록되었습니다',
    '/mypage/inquiries/' || p_inquiry_id::text,
    p_inquiry_id
  );
end;
$$;
