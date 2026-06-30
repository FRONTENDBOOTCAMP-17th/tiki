-- on_auth_user_created 트리거 및 handle_new_user() 함수 제거
-- 원래 설계 의도: 회원 데이터는 이메일 인증 완료 시에만 public.users에 저장.
-- handle_new_user()가 회원가입 즉시(인증 전) public.users에 INSERT해서
-- 미인증 임시 데이터가 남는 문제가 있었음.
-- handle_verified_user()가 인증 완료 시 public.users + seller_profiles를 생성하므로
-- handle_new_user()는 불필요함.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
