drop function if exists public.get_my_shared_tickets();

create function public.get_my_shared_tickets()
 returns table(share_id uuid, event_title text, slot_date date, slot_time text,
   shared_with_name text, quantity integer, status text, created_at timestamp with time zone)
 language sql security definer set search_path to 'public'
as $$
  select
    ts.share_id,
    e.title as event_title,
    s.date as slot_date,
    s.start_time::text as slot_time,
    u.name as shared_with_name,
    ts.quantity,
    ts.status,
    ts.created_at
  from public.ticket_share ts
  join public.orders o on o.order_id = ts.order_id
  join public.event e on e.event_id = o.event_id
  left join public.slot s on s.slot_id = o.slot_id
  join public.users u on u.id = ts.shared_with
  where ts.sharer_id = auth.uid()
  order by ts.created_at desc;
$$;
