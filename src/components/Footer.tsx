import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-mirage px-24 text-white transition-colors dark:border-[#3c4043] dark:bg-[#242528]">
      <div className="flex flex-row items-center justify-between border-b border-b-gray-700 py-8 dark:border-b-[#3c4043]">
        <p>
          티켓팅의 설렘이 공연이 끝난 뒤에도 오래 남도록
          <br />
          같은 순간을 사랑하는 사람들과 연결되는 티켓 마켓
        </p>
        <div className="grid grid-cols-3 gap-12 text-left text-sm">
          <div>
            <p className="mb-1 font-semibold">서비스</p>
            {/* TODO: 서비스 소개 라우트 확정 후 채우기 */}
            <Link
              href="#"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              서비스 소개
            </Link>
            <Link
              href="/terms"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              개인정보 처리방침
            </Link>
          </div>
          <div>
            <p className="mb-1 font-semibold">고객지원</p>
            <Link
              href="/support#faq"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              자주 묻는 질문
            </Link>
            <Link
              href="/mypage/inquiries"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              1:1 문의
            </Link>
            <Link
              href="/support#contact"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              고객센터
            </Link>
          </div>
          <div>
            <p className="mb-1 font-semibold">판매자</p>
            {/* TODO: 라우트 확정 후 href 채우기 */}
            <Link
              href="#"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              판매자 등록
            </Link>
            <Link
              href="#"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              판매자 가이드
            </Link>
            <Link
              href="#"
              className="block text-gray-400 transition-colors hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              정산 안내
            </Link>
          </div>
        </div>
      </div>

      <div className="py-8 text-left text-xs text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} TiKi. All rights reserved.
      </div>
    </footer>
  );
}
