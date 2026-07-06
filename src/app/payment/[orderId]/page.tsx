import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { createClient } from "@/lib/supabase/server";
import PaymentForm from "./_components/PaymentForm";

const SERVICE_FEE_RATE = 0.05;

// 잘못된 id 가 uuid 컬럼 캐스팅 에러를 일으키기 전에 형식 검증
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function PaymentStatusNotice({
  title,
  description,
  eventId,
}: {
  title: string;
  description: string;
  eventId?: string;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>
      </div>
      <div className="flex gap-3">
        <Link
          href={eventId ? `/${eventId}` : "/"}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-surface-3 dark:text-gray-200 dark:hover:bg-surface-2"
        >
          {eventId ? "다시 예매하기" : "홈으로"}
        </Link>
        <Link
          href="/mypage/reservations"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-700 px-5 text-sm font-medium text-white hover:bg-primary-800"
        >
          예매내역 보기
        </Link>
      </div>
    </main>
  );
}

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

  // 존재하지 않거나 내 주문이 아닌 경우: 없는 페이지(404)가 아니라 접근할 수
  // 없는 주문임을 알려준다. (다른 사용자의 주문인지 여부는 구분해 보여주지 않음)
  if (!order) {
    return (
      <PaymentStatusNotice
        title="잘못된 주문입니다"
        description="존재하지 않거나 접근할 수 없는 주문입니다. 예매내역에서 다시 확인해주세요."
      />
    );
  }

  // 이미 결제 완료된 주문은 결제창을 다시 띄울 필요가 없음.
  // 웹훅/결제확인 API가 리다이렉트보다 먼저 상태를 바꾸는 레이스나, 결제 후
  // 뒤로가기로 이 페이지에 돌아오는 경우가 있어 404 대신 안내 화면을 보여준다.
  if (order.status === ORDER_STATUS.PAID) {
    return (
      <PaymentStatusNotice
        title="이미 결제가 완료되었습니다"
        description="이미 결제가 완료된 예매입니다. 예매내역에서 확인해주세요."
        eventId={order.event_id}
      />
    );
  }

  const [{ data: event }, { data: slot }, { data: grade }, { data: profile }, { data: orderSeats }] =
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
        .select("name, phone, email, avatar_url, role")
        .eq("id", user.id)
        .single(),
      supabase
        .from("order_seat")
        .select("seat(label)")
        .eq("order_id", order.order_id),
    ]);

  if (!event || !slot || !grade) notFound();

  if (
    order.status === ORDER_STATUS.CANCELLED ||
    order.status === ORDER_STATUS.FAILED
  ) {
    const isCancelled = order.status === ORDER_STATUS.CANCELLED;

    return (
      <PaymentStatusNotice
        title={
          isCancelled
            ? "결제가 취소되었습니다"
            : "결제를 완료하지 못했습니다"
        }
        description={
          isCancelled
            ? "결제창에서 결제를 완료하지 않아 예매가 취소되었습니다. 필요하면 다시 예매를 진행해주세요."
            : "결제가 정상적으로 완료되지 않았습니다. 같은 공연을 다시 예매할 수 있습니다."
        }
        eventId={order.event_id}
      />
    );
  }

  if (order.status !== ORDER_STATUS.ORDERED) notFound();

  const subtotal = grade.price * order.quantity;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  const seatLabels = (orderSeats ?? [])
    .flatMap((row) => (Array.isArray(row.seat) ? row.seat : [row.seat]))
    .map((seat) => seat?.label)
    .filter((label): label is string => !!label)
    .sort();

  return (
    <PaymentForm
      orderId={order.order_id}
      totalAmount={order.total_price}
      headerProfile={{
        name: profile?.name ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        role: profile?.role ?? "buyer",
      }}
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
        seatLabels: seatLabels.length > 0 ? seatLabels : undefined,
      }}
      buyerDefaults={{
        name: profile?.name ?? "",
        phone: profile?.phone ?? "",
        email: profile?.email ?? "",
      }}
    />
  );
}
