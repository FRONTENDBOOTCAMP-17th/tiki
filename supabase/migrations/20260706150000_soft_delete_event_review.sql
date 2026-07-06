-- 게시글(event)·리뷰(review) 소프트 삭제
-- 관리자가 삭제해도 행을 실제로 지우지 않고 deleted_at 마킹만 한다.
-- 기존 하드 삭제는 event_image/slot/ticket_grade/review까지 연쇄로 사라져
-- 기록이 남지 않던 문제를 해결한다. (복구도 가능)

-- 1) 컬럼 추가
alter table public.event  add column if not exists deleted_at timestamptz;
alter table public.event  add column if not exists deleted_by uuid references public.users(id);
alter table public.review add column if not exists deleted_at timestamptz;

-- 2) 리뷰 유니크 제약 → 부분 유니크 인덱스
-- 소프트 삭제된 리뷰가 (order_id, user_id) 자리를 계속 차지하면
-- 사용자가 같은 예매 건으로 리뷰를 다시 못 쓰게 되므로, 활성 리뷰만 유니크로 잡는다.
-- (이 제약을 참조하는 FK 없음을 확인함 — review로 들어오는 FK는 모두 review_id PK 참조)
alter table public.review drop constraint if exists review_order_user_key;
create unique index if not exists review_order_user_active_unique
  on public.review(order_id, user_id)
  where deleted_at is null;

-- 3) get_event_reviews: 삭제된 리뷰는 공개 리뷰 목록에서 제외
create or replace function public.get_event_reviews(p_event_id uuid)
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
    and r.deleted_at is null
  group by r.review_id, u.name
  order by r.created_at desc;
$$;

-- 4) get_writable_review_slots: 삭제된 리뷰는 "이미 작성함" 판정에서 제외 (재작성 허용)
create or replace function public.get_writable_review_slots(p_event_id uuid)
returns table (order_id uuid, slot_date date, slot_start_time text)
language sql
security definer
set search_path = public
as $$
  with eligible as (
    select o.order_id, o.slot_id, o.created_at
    from public.orders o
    where o.user_id = auth.uid() and o.event_id = p_event_id and o.status = 'paid'
    union
    select o.order_id, o.slot_id, o.created_at
    from public.ticket_share ts
    join public.orders o on o.order_id = ts.order_id
    where ts.shared_with = auth.uid()
      and ts.status = 'accepted'
      and o.event_id = p_event_id
      and o.status = 'paid'
  )
  select el.order_id, s.date, s.start_time::text
  from eligible el
  join public.slot s on s.slot_id = el.slot_id
  where ((s.date + s.end_time) at time zone 'Asia/Seoul') <= now()
    and not exists (
      select 1 from public.review r
      where r.order_id = el.order_id
        and r.user_id = auth.uid()
        and r.deleted_at is null
    )
  order by el.created_at desc;
$$;

-- 5) get_seller_dashboard_stats: 삭제된 이벤트는 판매자 대시보드 집계에서 제외
-- (관리자 삭제는 활성 주문이 없는 이벤트만 가능하므로 매출 합계에는 영향 없음)
create or replace function public.get_seller_dashboard_stats(p_seller_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if auth.uid() is null or auth.uid() <> p_seller_id then
    raise exception 'UNAUTHORIZED';
  end if;

  with seller_events as (
    select event_id, title, status, thumbnail, start_date, end_date, venue_name, created_at
    from public.event
    where seller_id = p_seller_id::text
      and deleted_at is null
  ),
  order_stats as (
    select o.event_id,
           sum(o.quantity)::int as orders,
           sum(o.total_price)::bigint as revenue
    from public.orders o
    join seller_events e on e.event_id = o.event_id
    where o.status = 'paid'
    group by o.event_id
  ),
  capacity as (
    select g.event_id, sum(g.quantity)::int as seats
    from public.ticket_grade g
    join seller_events e on e.event_id = g.event_id
    group by g.event_id
  )
  select json_build_object(
    'total_revenue', coalesce((select sum(revenue) from order_stats), 0),
    'total_orders', coalesce((select sum(orders) from order_stats), 0),
    'public_count', (select count(*) from seller_events where status = '공개'),
    'remaining_seats', greatest(
      0,
      coalesce((select sum(seats) from capacity), 0) - coalesce((select sum(orders) from order_stats), 0)
    ),
    'events', coalesce((
      select json_agg(
        json_build_object(
          'event_id', e.event_id,
          'title', e.title,
          'status', e.status,
          'thumbnail', e.thumbnail,
          'start_date', e.start_date,
          'end_date', e.end_date,
          'venue_name', e.venue_name,
          'orders', coalesce(os.orders, 0),
          'revenue', coalesce(os.revenue, 0)
        )
        order by e.created_at desc
      )
      from seller_events e
      left join order_stats os on os.event_id = e.event_id
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;
