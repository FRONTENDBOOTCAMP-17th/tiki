drop policy if exists "seller reads own event reviews" on public.review;
create policy "seller reads own event reviews"
  on public.review
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.event e
      where e.event_id = review.event_id
        and e.seller_id = auth.uid()::text
    )
  );

drop policy if exists "seller reads own review authors" on public.users;
create policy "seller reads own review authors"
  on public.users
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.review r
      join public.event e on e.event_id = r.event_id
      where r.user_id = users.id
        and e.seller_id = auth.uid()::text
    )
  );

create table if not exists public.review_delete_request (
  request_id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.review(review_id) on delete cascade,
  seller_id uuid not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'review_delete_request_reason_check'
  ) then
    alter table public.review_delete_request
      add constraint review_delete_request_reason_check
      check (length(btrim(reason)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'review_delete_request_status_check'
  ) then
    alter table public.review_delete_request
      add constraint review_delete_request_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

create unique index if not exists review_delete_request_pending_unique
  on public.review_delete_request (review_id)
  where status = 'pending';

alter table public.review_delete_request enable row level security;
grant select on public.review_delete_request to authenticated;

drop policy if exists "seller reads own delete requests" on public.review_delete_request;
create policy "seller reads own delete requests"
  on public.review_delete_request
  for select
  to authenticated
  using (seller_id = auth.uid());

create or replace function public.request_review_deletion(p_review_id uuid, p_reason text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reason text := nullif(btrim(p_reason), '');
begin
  if v_uid is null or v_reason is null then
    return false;
  end if;

  if not exists (
    select 1 from review r
    join event e on e.event_id = r.event_id
    where r.review_id = p_review_id and e.seller_id = v_uid::text
  ) then
    return false;
  end if;

  if exists (
    select 1 from review_delete_request
    where review_id = p_review_id and status = 'pending'
  ) then
    return false;
  end if;

  insert into review_delete_request (review_id, seller_id, reason)
  values (p_review_id, v_uid, v_reason);
  return true;
end;
$$;

grant execute on function public.request_review_deletion(uuid, text) to authenticated;
