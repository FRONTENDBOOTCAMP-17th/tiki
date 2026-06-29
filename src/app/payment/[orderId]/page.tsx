import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PaymentForm from "./_components/PaymentForm";

const SERVICE_FEE_RATE = 0.05;

// 잘못된 id 가 uuid 컬럼 캐스팅 에러를 일으키기 전에 형식 검증
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!UUID_RE.test(orderId)) notFound();

  const user = await requireUser(`/payment/${orderId}`);
  const supabase = await createClient();

  // 본인 주문만 결제 페이지에 접근 가능 (order_id + user_id 동시 확인)
  const { data: order } = await supabase
    .from("orders")
    .select(
      "order_id, status, quantity, total_price, event_id, slot_id, ticket_grade_id",
    )
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  // 이미 결제 완료/실패 처리된 주문이면 결제창을 다시 띄울 필요가 없음
  if (order.status !== "ordered") notFound();

  const [{ data: event }, { data: slot }, { data: grade }, { data: profile }] =
    await Promise.all([
      supabase
        .from("event")
        .select("title, thumbnail, venue_name")
        .eq("event_id", order.event_id)
        .single(),
      supabase
        .from("slot")
        .select("date, start_time")
        .eq("slot_id", order.slot_id)
        .single(),
      supabase
        .from("ticket_grade")
        .select("grade_name, price")
        .eq("grade_id", order.ticket_grade_id)
        .single(),
      supabase
        .from("users")
        .select("name, phone, email")
        .eq("id", user.id)
        .single(),
    ]);

  if (!event || !slot || !grade) notFound();

  const subtotal = grade.price * order.quantity;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);

  return (
    <PaymentForm
      orderId={order.order_id}
      totalAmount={order.total_price}
      booking={{
        eventTitle: event.title,
        thumbnail: event.thumbnail,
        venueName: event.venue_name,
        date: slot.date,
        startTime: slot.start_time,
        gradeName: grade.grade_name,
        quantity: order.quantity,
        subtotal,
        fee,
      }}
      buyerDefaults={{
        name: profile?.name ?? "",
        phone: profile?.phone ?? "",
        email: profile?.email ?? "",
      }}
    />
  );
}
