-- 공개 읽기 RLS 정책
-- 공연 목록(event), 카테고리(category), 공연 이미지(event_image)는
-- 비로그인(anon) 포함 누구나 조회(SELECT) 가능하도록 한다.
-- INSERT/UPDATE/DELETE 정책은 별도(판매자/관리자 권한)로 추후 추가.

alter table public.event       enable row level security;
alter table public.category    enable row level security;
alter table public.event_image enable row level security;

drop policy if exists "public read events" on public.event;
create policy "public read events"
  on public.event
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read categories" on public.category;
create policy "public read categories"
  on public.category
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read event images" on public.event_image;
create policy "public read event images"
  on public.event_image
  for select
  to anon, authenticated
  using (true);
