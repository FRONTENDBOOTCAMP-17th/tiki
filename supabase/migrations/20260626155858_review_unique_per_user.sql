-- 1주문 1리뷰(UNIQUE order_id) → 주문당 사용자별 1리뷰(UNIQUE order_id, user_id)
-- 공유한 티켓의 보낸 사람과 받은 사람이 같은 주문에 각각 리뷰를 작성할 수 있도록 변경
alter table public.review drop constraint review_order_id_key;
alter table public.review add constraint review_order_user_key unique (order_id, user_id);
