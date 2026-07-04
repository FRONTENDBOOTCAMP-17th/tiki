-- 판매자 대시보드 통계 집계 RPC
-- 기존엔 event/orders/ticket_grade를 각각 조회해 TS에서 합산했는데,
-- 이벤트가 늘수록 쿼리가 늘어 한 번의 집계 쿼리로 통합한다.
-- 본인(auth.uid() = p_seller_id) 통계만 조회 가능.

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
    where seller_id = p_seller_id
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

revoke all on function public.get_seller_dashboard_stats(uuid) from public;
grant execute on function public.get_seller_dashboard_stats(uuid) to authenticated;
