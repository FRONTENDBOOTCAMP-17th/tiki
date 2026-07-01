-- handle_verified_user() 수정
-- 문제: on_email_verified 트리거의 handle_verified_user()에 충돌 처리가 없어
--       이메일 인증 시 users_email_key 유니크 제약 위반(SQLSTATE 23505) 발생.
-- 원인: on_auth_user_created(handle_new_user)가 회원가입 즉시 public.users에 INSERT하고,
--       인증 시 handle_verified_user()가 다시 INSERT를 시도해 충돌함.
-- 수정: handle_new_user()를 제거(→ 별도 마이그레이션)하고,
--       handle_verified_user()에서 public.users INSERT를 단독으로 처리하도록 함.
--       seller인 경우 seller_profiles도 함께 생성.

CREATE OR REPLACE FUNCTION public.handle_verified_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin

  insert into public.users (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  )
  on conflict (id) do nothing;

  if new.raw_user_meta_data->>'role' = 'seller' then

    insert into public.seller_profiles (id, organizer_name, store_name)
    values (
      new.id,
      new.raw_user_meta_data->>'organizer_name',
      new.raw_user_meta_data->>'store_name'
    )
    on conflict (id) do nothing;

  end if;

  return new;

end;
$$;
