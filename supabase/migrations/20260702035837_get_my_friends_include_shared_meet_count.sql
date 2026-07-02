-- get_my_friends: meet_count 보정
-- 기존: 나와 친구가 "둘 다 직접 예매(paid)"한 공연만 카운트.
-- 문제: 한 명이 예매하고 다른 한 명이 공유받아 수락(accepted)한 경우 = 함께 간 공연인데 0으로 셈.
-- 수정: "참석" 정의를 [직접 예매(paid) OR 공유받아 수락(accepted + 원주문 paid)]로 확장.
--       나의 참석 이벤트 집합 ∩ 친구의 참석 이벤트 집합을 distinct event_id로 카운트.
--       o.status = 'paid' 조건을 양쪽에 둬서 취소된 원주문의 공유는 제외 (received_tickets 정책과 일관).

create or replace function public.get_my_friends()
returns table(friend_id uuid, user_id uuid, name text, email text, avatar_url text, meet_count bigint)
language sql
security definer
set search_path to 'public'
as $function$
  select
    f.friend_id,
    u.id as user_id,
    u.name,
    u.email,
    u.avatar_url,
    (
      select count(distinct ev.event_id)
      from (
        -- 내가 참석한 공연 (직접 예매 or 공유받아 수락)
        select o.event_id
        from public.orders o
        where o.user_id = auth.uid() and o.status = 'paid'
        union
        select o.event_id
        from public.ticket_share ts
        join public.orders o on o.order_id = ts.order_id
        where ts.shared_with = auth.uid()
          and ts.status = 'accepted'
          and o.status = 'paid'
      ) ev
      where ev.event_id in (
        -- 친구가 참석한 공연 (직접 예매 or 공유받아 수락)
        select o.event_id
        from public.orders o
        where o.user_id = u.id and o.status = 'paid'
        union
        select o.event_id
        from public.ticket_share ts
        join public.orders o on o.order_id = ts.order_id
        where ts.shared_with = u.id
          and ts.status = 'accepted'
          and o.status = 'paid'
      )
    ) as meet_count
  from public.friend f
  join public.users u
    on u.id = case
      when f.requester_id = auth.uid() then f.addressee_id
      else f.requester_id
    end
  where f.status = 'accepted'
    and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  order by u.name;
$function$;
