create or replace function public.get_my_received_tickets()
 returns table(share_id uuid, order_id uuid, event_title text, venue_name text,
   venue_address text, slot_date date, slot_time text, grade_name text,
   sharer_name text, quantity integer, created_at timestamp with time zone)
 language sql security definer set search_path to 'public'
as $$
  select ts.share_id, ts.order_id, e.title, e.venue_name, e.venue_address,
    s.date, s.start_time::text, g.grade_name, u.name, ts.quantity, ts.created_at
  from public.ticket_share ts
  join public.orders o on o.order_id = ts.order_id
  join public.event e on e.event_id = o.event_id
  left join public.slot s on s.slot_id = o.slot_id
  left join public.ticket_grade g on g.grade_id = o.ticket_grade_id
  join public.users u on u.id = ts.sharer_id
  where ts.shared_with = auth.uid()
    and ts.status = 'accepted'
    and o.status = 'paid'
  order by ts.created_at desc;
$$;
