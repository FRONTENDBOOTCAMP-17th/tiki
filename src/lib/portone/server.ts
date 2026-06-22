import "server-only";
import { PaymentClient } from "@portone/server-sdk";

// 결제 조회/취소 등 서버 전용 API 호출에 쓰는 포트원 클라이언트.
// API Secret은 클라이언트에 노출되면 안 되므로 이 파일은 서버에서만 import 한다.
export const portone = PaymentClient({ secret: process.env.PORTONE_API_SECRET! });
