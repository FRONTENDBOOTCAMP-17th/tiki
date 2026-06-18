// 개인정보처리방침

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export default function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-gray-600">
      <Section title="1. 개인정보의 수집 및 이용 목적">
        <p>회사는 다음 목적을 위하여 개인정보를 수집·이용합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>회원가입 및 로그인</li>
          <li>회원 식별 및 본인 확인</li>
          <li>이벤트 예매 및 티켓 발급</li>
          <li>친구 기능 제공</li>
          <li>판매자 인증 심사</li>
          <li>고객 문의 응대</li>
          <li>서비스 운영 및 개선</li>
          <li>부정 이용 방지</li>
          <li>통계 분석 및 서비스 품질 향상</li>
        </ul>
      </Section>

      <Section title="2. 수집하는 개인정보 항목">
        <p className="font-medium text-gray-800">회원가입 시</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>이름</li>
          <li>이메일 주소</li>
          <li>비밀번호</li>
          <li>전화번호</li>
        </ul>
        <p className="pt-1 font-medium text-gray-800">판매자 회원의 경우</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>스토어명</li>
          <li>주최자명</li>
          <li>사업자등록번호(선택)</li>
          <li>사업자등록증 등 인증 서류</li>
        </ul>
        <p className="pt-1 font-medium text-gray-800">
          서비스 이용 과정에서 자동 수집
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>IP 주소</li>
          <li>브라우저 정보</li>
          <li>운영체제 정보</li>
          <li>쿠키 정보</li>
          <li>접속 로그</li>
          <li>서비스 이용 기록</li>
        </ul>
        <p className="pt-1 font-medium text-gray-800">친구 기능 이용 시</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>친구 요청 정보</li>
          <li>친구 수락 여부</li>
          <li>친구 차단 여부</li>
        </ul>
        <p className="pt-1 font-medium text-gray-800">
          라이브러리 기능 이용 시
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>예매 내역</li>
          <li>입장 기록</li>
          <li>리뷰 및 별점</li>
          <li>공연 관람 기록</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용기간">
        <p>
          회사는 개인정보 수집 및 이용 목적이 달성된 후 지체 없이 파기합니다.
          다만 관련 법령에 따라 다음과 같이 보관할 수 있습니다.
        </p>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 text-gray-800">
              <th className="py-2 font-medium">보관 항목</th>
              <th className="py-2 font-medium">보관 기간</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2">계약 또는 청약철회 기록</td>
              <td className="py-2">5년</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">대금결제 및 재화 공급 기록</td>
              <td className="py-2">5년</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">소비자 불만 및 분쟁처리 기록</td>
              <td className="py-2">3년</td>
            </tr>
            <tr>
              <td className="py-2">접속 로그</td>
              <td className="py-2">3개월</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>
          회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만
          다음의 경우에는 예외로 합니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 따라 제공 의무가 있는 경우</li>
          <li>수사기관 등 관계기관의 적법한 요청이 있는 경우</li>
        </ul>
      </Section>

      <Section title="5. 개인정보 처리 위탁">
        <p>
          회사는 원활한 서비스 제공을 위하여 다음 업무를 외부 업체에 위탁할 수
          있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>클라우드 인프라 운영</li>
          <li>본인 인증</li>
          <li>결제 서비스</li>
          <li>문자 및 이메일 발송</li>
        </ul>
        <p>위탁업체가 변경될 경우 서비스 내 공지사항을 통해 안내합니다.</p>
      </Section>

      <Section title="6. 쿠키의 사용">
        <p>
          회사는 로그인 유지 및 서비스 최적화를 위하여 쿠키를 사용할 수
          있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나
          일부 서비스 이용에 제한이 발생할 수 있습니다.
        </p>
      </Section>

      <Section title="7. 이용자의 권리">
        <p>
          이용자는 언제든지 자신의 개인정보에 대하여 다음 권리를 행사할 수
          있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>조회</li>
          <li>수정</li>
          <li>삭제</li>
          <li>처리정지 요청</li>
          <li>회원 탈퇴</li>
        </ul>
      </Section>

      <Section title="8. 개인정보의 파기">
        <p>
          회사는 개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우 지체
          없이 파기합니다. 전자적 파일은 복구가 불가능한 방법으로 삭제하며, 종이
          문서는 분쇄 또는 소각합니다.
        </p>
      </Section>

      <Section title="9. 개인정보 보호를 위한 조치">
        <p>회사는 개인정보 보호를 위하여 다음과 같은 조치를 시행합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>비밀번호 암호화 저장</li>
          <li>접근 권한 최소화</li>
          <li>관리자 권한 분리</li>
          <li>HTTPS 통신 적용</li>
          <li>접근 기록 관리</li>
          <li>데이터베이스 접근 통제</li>
        </ul>
      </Section>

      <Section title="10. 개인정보 보호책임자">
        <p>개인정보 보호 관련 문의는 아래 담당자에게 연락할 수 있습니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>담당자 : TiKi 운영팀</li>
          <li>이메일 : 추후 지정 예정</li>
        </ul>
      </Section>

      <Section title="11. 개인정보처리방침의 변경">
        <p>
          본 개인정보처리방침은 관련 법령 또는 서비스 정책 변경에 따라 수정될 수
          있으며, 변경 시 서비스 내 공지사항을 통해 안내합니다.
        </p>
      </Section>

      <p className="pt-2 text-gray-500">
        부칙 — 본 개인정보처리방침은 2026년 6월 18일부터 시행합니다.
      </p>
    </div>
  );
}
