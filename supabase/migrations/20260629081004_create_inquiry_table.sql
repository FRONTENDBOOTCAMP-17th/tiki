-- 1:1 문의 테이블
create table public.inquiry (
  inquiry_id  uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  category    text not null default 'etc'
                check (category = any (array['reservation','payment','ticket','account','etc'])),
  title       text not null,
  content     text not null,
  status      text not null default 'pending'
                check (status = any (array['pending','answered'])),
  answer      text,
  answered_at timestamptz,
  answered_by uuid references public.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_inquiry_user    on public.inquiry(user_id);
create index idx_inquiry_status   on public.inquiry(status);
create index idx_inquiry_created  on public.inquiry(created_at desc);

-- RLS
alter table public.inquiry enable row level security;

-- 본인 문의 조회
create policy "inquiry_select_own" on public.inquiry
  for select using (auth.uid() = user_id);

-- 본인 문의 작성
create policy "inquiry_insert_own" on public.inquiry
  for insert with check (auth.uid() = user_id);

-- 관리자 전체 조회
create policy "inquiry_select_admin" on public.inquiry
  for select using (
    exists (select 1 from public.users u
            where u.id = auth.uid() and u.role = 'admin')
  );

-- 관리자 답변(update)
create policy "inquiry_update_admin" on public.inquiry
  for update using (
    exists (select 1 from public.users u
            where u.id = auth.uid() and u.role = 'admin')
  );
