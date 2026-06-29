import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-mirage text-white px-24 border-t">
      <div className="flex flex-row justify-between items-center border-b border-b-gray-700 py-8">
        <p>
          티켓팅의 설렘이 공연이 끝난 뒤에도 오래 남도록
          <br />
          같은 순간을 사랑하는 사람들과 연결되는 티켓 마켓
        </p>
        <div className="grid grid-cols-3 gap-12 text-sm text-left">
          <div>
            <p className="font-semibold mb-1">서비스</p>
            {/* TODO: 서비스 소개 라우트 확정 후 채우기 */}
            <Link
              href="#"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              서비스 소개
            </Link>
            <Link
              href="/terms"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              개인정보 처리방침
            </Link>
          </div>
          <div>
            <p className="font-semibold mb-1">고객지원</p>
            <Link
              href="/support#faq"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              자주 묻는 질문
            </Link>
            <Link
              href="/mypage/inquiries"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              1:1 문의
            </Link>
            <Link
              href="/support#contact"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              고객센터
            </Link>
          </div>
          <div>
            <p className="font-semibold mb-1">판매자</p>
            {/* TODO: 라우트 확정 후 href 채우기 */}
            <Link
              href="#"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              판매자 등록
            </Link>
            <Link
              href="#"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              판매자 가이드
            </Link>
            <Link
              href="#"
              className="block text-gray-400 hover:text-white transition-colors"
            >
              정산 안내
            </Link>
          </div>
        </div>
      </div>

      <div className="py-8 text-xs text-gray-500 text-left">
        &copy; {new Date().getFullYear()} TiKi. All rights reserved.
      </div>
    </footer>
  );
}
