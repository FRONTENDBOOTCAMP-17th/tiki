drop policy if exists "seller reads own event orders" on public.orders;
create policy "seller reads own event orders"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.event e
      where e.event_id = orders.event_id
        and e.seller_id = auth.uid()::text
    )
  );

drop policy if exists "seller reads own order buyers" on public.users;
create policy "seller reads own order buyers"
  on public.users
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      join public.event e on e.event_id = o.event_id
      where o.user_id = users.id
        and e.seller_id = auth.uid()::text
    )
  );

create or replace function public.place_order(
  p_event_id uuid,
  p_slot_id uuid,
  p_grade_id uuid,
  p_quantity int,
  p_total_price int,
  p_status text default 'ordered'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;
  if p_quantity < 1 then
    raise exception 'INVALID_QUANTITY';
  end if;

  update ticket_grade
     set quantity = quantity - p_quantity
   where grade_id = p_grade_id
     and event_id = p_event_id
     and quantity >= p_quantity;

  if not found then
    raise exception 'SOLD_OUT';
  end if;

  insert into orders (
    event_id, slot_id, ticket_grade_id, quantity, total_price, status, user_id
  ) values (
    p_event_id, p_slot_id, p_grade_id, p_quantity, p_total_price, p_status, v_uid
  )
  returning order_id into v_order_id;

  return v_order_id;
end;
$$;

grant execute on function public.place_order(uuid, uuid, uuid, int, int, text) to authenticated;

create or replace function public.cancel_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_grade uuid;
  v_qty int;
begin
  if v_uid is null then
    return false;
  end if;

  update orders o
     set status = 'cancelled'
   where o.order_id = p_order_id
     and o.status <> 'cancelled'
     and (
       o.user_id = v_uid
       or exists (
         select 1 from event e
         where e.event_id = o.event_id and e.seller_id = v_uid::text
       )
     )
  returning o.ticket_grade_id, o.quantity into v_grade, v_qty;

  if not found then
    return false;
  end if;

  delete from review where order_id = p_order_id;
  update ticket_grade set quantity = quantity + v_qty where grade_id = v_grade;
  return true;
end;
$$;

grant execute on function public.cancel_order(uuid) to authenticated;
