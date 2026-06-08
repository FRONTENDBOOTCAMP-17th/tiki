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
            <p className="text-gray-400">서비스 소개</p>
            <p className="text-gray-400">이용약관</p>
            <p className="text-gray-400">개인정보 처리방침</p>
          </div>
          <div>
            <p className="font-semibold mb-1">고객지원</p>
            <p className="text-gray-400">자주 묻는 질문</p>
            <p className="text-gray-400">1:1 문의</p>
            <p className="text-gray-400">고객센터</p>
          </div>
          <div>
            <p className="font-semibold mb-1">판매자</p>
            <p className="text-gray-400">판매자 등록</p>
            <p className="text-gray-400">판매자 가이드</p>
            <p className="text-gray-400">정산 안내</p>
          </div>
        </div>
      </div>

      <div className="py-8 text-xs text-gray-500 text-left">
        &copy; {new Date().getFullYear()} TiKi. All rights reserved.
      </div>
    </footer>
  );
}
