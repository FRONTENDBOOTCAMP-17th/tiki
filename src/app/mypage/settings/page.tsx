import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Toggle from "@/components/Toggle";
import InfoLinkButton from "@/components/mypage/InfoLinkButton";
import WithdrawButton from "@/components/mypage/WithdrawButton";

// 더미 알림 설정 (나중에 Supabase 조회로 교체)
const notif = { friend: true, event: true, marketing: false };

function SettingLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-colors hover:bg-gray-50"
    >
      <span className="font-medium text-gray-900">{label}</span>
      <ChevronRight size={18} className="text-gray-400" />
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* 설정 카드 */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900">
          설정
        </h1>

        <div className="mt-6 flex flex-col gap-8">
          {/* 알림 설정 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">알림 설정</h2>
            <Toggle
              name="friend"
              title="친구 신청 알림"
              description="친구 신청 알림을 받습니다"
              defaultChecked={notif.friend}
            />
            <Toggle
              name="event"
              title="이벤트 시작 알림"
              description="공연 시작 1시간 전 알림을 받습니다"
              defaultChecked={notif.event}
            />
            <Toggle
              name="marketing"
              title="마케팅 알림"
              description="이벤트 및 프로모션 정보를 받습니다"
              defaultChecked={notif.marketing}
            />
          </div>

          {/* 개인정보 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">개인정보</h2>
            <InfoLinkButton label="개인정보 처리방침" title="개인정보 처리방침">
              <div className="space-y-5 text-sm leading-6 text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    1. 개인정보의 수집 및 이용 목적
                  </h3>
                  <p>회사는 다음 목적을 위하여 개인정보를 수집·이용합니다.</p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>회원가입 및 로그인</li>
                    <li>회원 식별 및 본인 확인</li>
                    <li>이벤트 예매 및 티켓 발급</li>
                    <li>친구 기능 제공</li>
                    <li>고객 문의 응대</li>
                    <li>서비스 운영 및 개선</li>
                    <li>부정 이용 방지</li>
                    <li>통계 분석 및 서비스 품질 향상</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    2. 수집하는 개인정보 항목
                  </h3>

                  <p className="mt-2 font-medium text-gray-800">회원가입 시</p>
                  <ul className="list-disc pl-5">
                    <li>이름</li>
                    <li>이메일 주소</li>
                    <li>비밀번호</li>
                    <li>전화번호</li>
                  </ul>

                  <p className="mt-3 font-medium text-gray-800">
                    판매자 회원의 경우
                  </p>
                  <ul className="list-disc pl-5">
                    <li>스토어명</li>
                    <li>주최자명</li>
                  </ul>

                  <p className="mt-3 font-medium text-gray-800">
                    서비스 이용 과정에서 자동 수집
                  </p>
                  <ul className="list-disc pl-5">
                    <li>IP 주소</li>
                    <li>브라우저 정보</li>
                    <li>운영체제 정보</li>
                    <li>쿠키 정보</li>
                    <li>접속 로그</li>
                    <li>서비스 이용 기록</li>
                  </ul>

                  <p className="mt-3 font-medium text-gray-800">
                    친구 기능 이용 시
                  </p>
                  <ul className="list-disc pl-5">
                    <li>친구 요청 정보</li>
                    <li>친구 수락 여부</li>
                    <li>친구 차단 여부</li>
                  </ul>

                  <p className="mt-3 font-medium text-gray-800">
                    라이브러리 기능 이용 시
                  </p>
                  <ul className="list-disc pl-5">
                    <li>예매 내역</li>
                    <li>입장 기록</li>
                    <li>리뷰 및 별점</li>
                    <li>공연 관람 기록</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    3. 개인정보의 보유 및 이용기간
                  </h3>
                  <p>
                    회사는 개인정보 수집 및 이용 목적이 달성된 후 지체 없이
                    파기합니다. 다만 관련 법령에 따라 다음과 같이 보관할 수
                    있습니다.
                  </p>

                  <ul className="mt-2 list-disc pl-5">
                    <li>계약 또는 청약철회 기록 : 5년</li>
                    <li>대금결제 및 재화 공급 기록 : 5년</li>
                    <li>소비자 불만 및 분쟁처리 기록 : 3년</li>
                    <li>접속 로그 : 3개월</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    4. 개인정보의 제3자 제공
                  </h3>
                  <p>
                    회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지
                    않습니다.
                  </p>
                  <p className="mt-2">다만 다음의 경우에는 예외로 합니다.</p>
                  <ul className="list-disc pl-5">
                    <li>이용자가 사전에 동의한 경우</li>
                    <li>법령에 따라 제공 의무가 있는 경우</li>
                    <li>수사기관 등 관계기관의 적법한 요청이 있는 경우</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    5. 개인정보 처리 위탁
                  </h3>
                  <p>
                    회사는 원활한 서비스 제공을 위하여 다음 업무를 외부 업체에
                    위탁할 수 있습니다.
                  </p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>클라우드 인프라 운영</li>
                    <li>본인 인증</li>
                    <li>결제 서비스</li>
                    <li>문자 및 이메일 발송</li>
                  </ul>
                  <p className="mt-2">
                    위탁업체가 변경될 경우 서비스 내 공지사항을 통해 안내합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    6. 쿠키의 사용
                  </h3>
                  <p>
                    회사는 로그인 유지 및 서비스 최적화를 위하여 쿠키를 사용할
                    수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을
                    거부할 수 있으나, 일부 서비스 이용에 제한이 발생할 수
                    있습니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    7. 이용자의 권리
                  </h3>
                  <p>
                    이용자는 언제든지 자신의 개인정보에 대하여 다음 권리를
                    행사할 수 있습니다.
                  </p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>조회</li>
                    <li>수정</li>
                    <li>삭제</li>
                    <li>처리정지 요청</li>
                    <li>회원 탈퇴</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    8. 개인정보의 파기
                  </h3>
                  <p>
                    회사는 개인정보 보유기간이 경과하거나 처리 목적이 달성된
                    경우 지체 없이 파기합니다.
                  </p>
                  <p className="mt-2">
                    전자적 파일은 복구가 불가능한 방법으로 삭제하며, 종이 문서는
                    분쇄 또는 소각합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    9. 개인정보 보호를 위한 조치
                  </h3>
                  <ul className="list-disc pl-5">
                    <li>비밀번호 암호화 저장</li>
                    <li>접근 권한 최소화</li>
                    <li>관리자 권한 분리</li>
                    <li>HTTPS 통신 적용</li>
                    <li>접근 기록 관리</li>
                    <li>데이터베이스 접근 통제</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    10. 개인정보 보호책임자
                  </h3>
                  <p>
                    개인정보 보호 관련 문의는 아래 담당자에게 연락할 수
                    있습니다.
                  </p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>담당자 : TiKi 운영팀</li>
                    <li>이메일 : 추후 지정 예정</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    11. 개인정보처리방침의 변경
                  </h3>
                  <p>
                    본 개인정보처리방침은 관련 법령 또는 서비스 정책 변경에 따라
                    수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해
                    안내합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">부칙</h3>
                  <p>본 개인정보처리방침은 2026년 6월 18일부터 시행합니다.</p>
                </div>
              </div>
            </InfoLinkButton>

            <InfoLinkButton label="서비스 이용약관" title="서비스 이용약관">
              <div className="space-y-5 text-sm leading-6 text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-900">제1조 (목적)</h3>
                  <p>
                    본 약관은 TiKi(이하 "회사")가 제공하는 예약형 티켓 오픈마켓
                    플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자
                    간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">제2조 (정의)</h3>
                  <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                  <ol className="mt-2 list-decimal pl-5">
                    <li>
                      서비스란 회사가 제공하는 공연, 전시, 클래스, 팬미팅,
                      스포츠 경기 등 일정 기반 상품의 등록, 검색, 예매 및 관련
                      부가 서비스를 의미합니다.
                    </li>
                    <li>
                      회원이란 본 약관에 동의하고 회원가입을 완료한 자를
                      의미합니다.
                    </li>
                    <li>
                      구매자란 서비스를 통해 이벤트를 예매하는 회원을
                      의미합니다.
                    </li>
                    <li>
                      판매자란 이벤트를 등록하고 판매하는 회원을 의미합니다.
                    </li>
                    <li>
                      티켓이란 이벤트 참여 권한을 나타내는 전자적 증표를
                      의미합니다.
                    </li>
                    <li>
                      QR 티켓이란 회사가 발급하는 전자 입장권을 의미합니다.
                    </li>
                    <li>
                      친구란 서비스 내 친구 등록 기능을 통해 상호 연결된 회원을
                      의미합니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제3조 (약관의 게시 및 변경)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      회사는 본 약관의 내용을 회원이 쉽게 확인할 수 있도록
                      서비스 내에 게시합니다.
                    </li>
                    <li>
                      회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할
                      수 있습니다.
                    </li>
                    <li>
                      변경된 약관은 시행일 7일 전부터 공지하며, 회원에게 불리한
                      변경의 경우 시행일 30일 전부터 공지합니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제4조 (회원가입)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      이용자는 회사가 정한 절차에 따라 회원가입을 신청할 수
                      있습니다.
                    </li>
                    <li>
                      회원가입 시 정확하고 최신의 정보를 제공하여야 합니다.
                    </li>
                    <li>
                      다음 각 호에 해당하는 경우 회사는 회원가입을 거절하거나
                      사후 취소할 수 있습니다.
                      <ul className="mt-2 list-disc pl-5">
                        <li>타인의 정보를 도용한 경우</li>
                        <li>허위 정보를 기재한 경우</li>
                        <li>서비스 운영을 방해할 목적으로 가입한 경우</li>
                        <li>기타 관련 법령에 위반되는 경우</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제5조 (서비스 이용)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      회원은 회사가 제공하는 서비스를 자유롭게 이용할 수
                      있습니다.
                    </li>
                    <li>
                      회사는 서비스의 품질 향상을 위하여 일부 기능을 변경하거나
                      중단할 수 있습니다.
                    </li>
                    <li>
                      시스템 점검, 장애, 천재지변 등의 사유가 발생하는 경우
                      서비스 제공이 일시적으로 제한될 수 있습니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제6조 (이벤트 예매)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      구매자는 서비스에서 제공하는 이벤트를 예매할 수 있습니다.
                    </li>
                    <li>예매는 결제 완료 시점에 최종 확정됩니다.</li>
                    <li>
                      결제 과정 중 재고 부족, 시스템 오류 등의 사유가 발생할
                      경우 예매가 취소될 수 있습니다.
                    </li>
                    <li>
                      회사는 부정 예매 방지를 위해 구매 수량 제한을 적용할 수
                      있습니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제7조 (QR 티켓 및 입장)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>예매가 완료된 회원에게 QR 티켓이 발급됩니다.</li>
                    <li>QR 티켓은 해당 이벤트의 입장 권한을 나타냅니다.</li>
                    <li>이미 사용된 QR 티켓은 재사용할 수 없습니다.</li>
                    <li>
                      QR 티켓의 위조, 변조 또는 무단 사용이 확인될 경우 입장이
                      제한될 수 있습니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제8조 (티켓 공유)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      회원은 서비스 내 친구 기능을 이용하여 티켓을 무료로 공유할
                      수 있습니다.
                    </li>
                    <li>
                      티켓 공유는 회사가 제공하는 기능을 통해서만 가능합니다.
                    </li>
                    <li>공유받은 티켓은 재공유할 수 없습니다.</li>
                    <li>티켓의 유상 양도 및 재판매는 금지됩니다.</li>
                    <li>
                      회사는 암표 거래 또는 부정 거래가 의심되는 경우 이용을
                      제한할 수 있습니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제9조 (환불 및 취소)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      회원은 이벤트 시작 전까지 예매 취소를 신청할 수 있습니다.
                    </li>
                    <li>환불 기준은 회사의 환불 정책에 따릅니다.</li>
                    <li>
                      이벤트 주최자의 사정으로 이벤트가 취소되는 경우 회사는
                      환불 절차를 안내합니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제10조 (회원의 의무)
                  </h3>
                  <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>타인의 개인정보 도용</li>
                    <li>허위 정보 등록</li>
                    <li>서비스 운영 방해 행위</li>
                    <li>자동화 프로그램(매크로) 사용</li>
                    <li>다중 계정을 이용한 부정 예매</li>
                    <li>티켓 암표 거래</li>
                    <li>법령 또는 공공질서에 반하는 행위</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제11조 (판매자의 의무)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>실제 존재하는 이벤트만 등록하여야 합니다.</li>
                    <li>이벤트 관련 정보를 정확하게 제공하여야 합니다.</li>
                    <li>관련 법령을 준수하여 이벤트를 운영하여야 합니다.</li>
                    <li>허위 또는 과장된 정보를 게시하여서는 안 됩니다.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제12조 (이용 제한)
                  </h3>
                  <p>
                    회사는 다음 각 호의 경우 회원의 서비스 이용을 제한할 수
                    있습니다.
                  </p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>약관 위반</li>
                    <li>부정 예매</li>
                    <li>매크로 사용</li>
                    <li>암표 거래</li>
                    <li>서비스 운영 방해</li>
                    <li>기타 법령 위반 행위</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제13조 (면책조항)
                  </h3>
                  <ol className="list-decimal pl-5">
                    <li>
                      회사는 판매자가 등록한 이벤트 정보의 정확성을 보증하지
                      않습니다.
                    </li>
                    <li>
                      회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 인한
                      손해에 대하여 책임을 지지 않습니다.
                    </li>
                    <li>
                      회사는 회원 간 또는 회원과 판매자 간 발생한 분쟁에
                      개입하지 않으며 관련 책임을 부담하지 않습니다.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    제14조 (준거법 및 관할)
                  </h3>
                  <p>
                    본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과
                    관련하여 발생한 분쟁은 대한민국 법원을 관할 법원으로 합니다.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">부칙</h3>
                  <p>본 약관은 2026년 6월 18일부터 시행합니다.</p>
                </div>
              </div>
            </InfoLinkButton>
          </div>

          {/* 계정 관리 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">계정 관리</h2>
            <SettingLink href="/mypage/password" label="비밀번호 변경" />
            <WithdrawButton />
          </div>
        </div>
      </section>

      {/* 설정 안내 */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-3 font-semibold text-gray-900">설정 안내</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-gray-500">
          <li>
            알림 설정에서 친구 신청 및 이벤트 관련 알림 수신 여부를 변경할 수
            있습니다
          </li>
          <li>
            원하는 알림만 선택하여 받아볼 수 있으며, 알림 수신 여부는 언제든지
            변경할 수 있습니다
          </li>
          <li>서비스 이용약관 및 개인정보 처리방침을 확인할 수 있습니다</li>
          <li>회원 탈퇴 시 일부 정보는 관련 법령에 따라 보관될 수 있습니다</li>
        </ul>
      </section>
    </div>
  );
}
