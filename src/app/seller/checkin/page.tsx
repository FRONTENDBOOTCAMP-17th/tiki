// 판매자 직접 스캔, 데스크탑. 가드는 seller 레이아웃이 함.
import CheckinScanner from "@/components/checkin/CheckinScanner";

export const metadata = {
  title: "입장 검증",
};

export default function SellerCheckinPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        입장 검증
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        관람객의 QR 티켓을 스캔해 입장을 처리합니다
      </p>
      <div className="mt-6">
        <CheckinScanner />
      </div>
    </div>
  );
}
