-- 마이페이지 부가: 아바타(프로필 사진) + 예매 취소 권한
-- users.avatar_url 컬럼, users/orders UPDATE 정책, storage avatars 버킷 정책

-- ============================================================
-- users.avatar_url 컬럼 (프로필 사진 URL)
-- ============================================================
alter table public.users add column if not exists avatar_url text;

-- ============================================================
-- users 본인 UPDATE 정책 (avatar_url 등 본인 정보 수정)
-- ============================================================
create policy "update own user"
  on public.users for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- orders 본인 UPDATE 정책 (예매 취소)
-- ============================================================
create policy "update own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- storage: avatars 버킷 정책 (로그인 유저가 avatars 버킷 사용)
-- 주의: avatars 버킷은 Supabase 대시보드에서 Public 버킷으로 생성되어 있어야 함
-- ============================================================
create policy "avatar all"
  on storage.objects for all to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');
