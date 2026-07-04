import { ImageResponse } from "next/og";
import { getEventDetail } from "@/lib/event/queries";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const EVENT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatPeriod(start: string, end: string) {
  const toDot = (date: string) => date.replace(/-/g, ".");
  return start === end ? toDot(start) : `${toDot(start)} - ${toDot(end)}`;
}

function fallbackCard() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tiki-final.vercel.app";
  const logoUrl = new URL("/tiki-character-readme.svg", siteUrl).toString();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F1FA",
        color: "#332A40",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 36,
        }}
      >
        <img src={logoUrl} alt="TiKi" width={180} height={180} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 84, fontWeight: 800 }}>TiKi</span>
          <span style={{ marginTop: 8, fontSize: 32, color: "#6B5A78" }}>
            특별한 순간을 만나는 티켓 마켓
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = EVENT_ID_RE.test(eventId)
    ? await getEventDetail(eventId).catch(() => null)
    : null;

  if (!event) {
    return new ImageResponse(fallbackCard(), size);
  }

  const poster = event.images[0];
  const period = formatPeriod(event.startDate, event.endDate);
  const venue = event.venue.address || "장소 미정";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#332A40",
          color: "#FFFFFF",
          padding: 56,
          gap: 48,
        }}
      >
        <div
          style={{
            width: 360,
            height: 518,
            display: "flex",
            overflow: "hidden",
            borderRadius: 28,
            background: "#F6F1FA",
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          }}
        >
          {poster ? (
            <img
              src={poster}
              alt={event.title}
              width={360}
              height={518}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9B6FC0",
                fontSize: 54,
                fontWeight: 800,
              }}
            >
              TiKi
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "fit-content",
              borderRadius: 999,
              background: "#9B6FC0",
              padding: "10px 22px",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {event.category || "TiKi"}
          </div>
          <h1
            style={{
              margin: "34px 0 0",
              fontSize: 72,
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {event.title}
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 34,
              fontSize: 30,
              color: "#E9DFF2",
            }}
          >
            <span>{period}</span>
            <span>{venue}</span>
          </div>
          <div
            style={{
              marginTop: 58,
              fontSize: 34,
              fontWeight: 800,
              color: "#F6F1FA",
            }}
          >
            TiKi
          </div>
        </div>
      </div>
    ),
    size,
  );
}
