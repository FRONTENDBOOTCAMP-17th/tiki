alter table public.review drop constraint if exists review_event_id_user_id_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'review_order_id_key'
  ) then
    alter table public.review add constraint review_order_id_key unique (order_id);
  end if;
end $$;

drop function if exists public.get_event_reviews(uuid);
create function public.get_event_reviews(p_event_id uuid)
returns table (
  review_id uuid,
  rating integer,
  memo text,
  created_at timestamptz,
  user_id uuid,
  author_name text,
  like_count bigint,
  liked_by_me boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.review_id,
    r.rating,
    r.memo,
    r.created_at,
    r.user_id,
    case
      when u.name is null or length(trim(u.name)) = 0 then '익명'
      when length(u.name) = 1 then u.name
      else left(u.name, 1) || repeat('*', length(u.name) - 1)
    end as author_name,
    count(rl.user_id) as like_count,
    exists (
      select 1 from public.review_like mine
      where mine.review_id = r.review_id and mine.user_id = auth.uid()
    ) as liked_by_me
  from public.review r
  left join public.users u on u.id = r.user_id
  left join public.review_like rl on rl.review_id = r.review_id
  where r.event_id = p_event_id
  group by r.review_id, u.name
  order by r.created_at desc;
$$;

grant execute on function public.get_event_reviews(uuid) to anon, authenticated;
