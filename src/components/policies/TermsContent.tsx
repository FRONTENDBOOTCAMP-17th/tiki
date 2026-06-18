// TiKi 서비스 이용약관

function Article({
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

export default function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-gray-600">
      <Article title="제1조 (목적)">
        <p>
          본 약관은 TiKi(이하 &quot;회사&quot;)가 제공하는 예약형 티켓 오픈마켓
          플랫폼 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자
          간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </Article>

      <Article title="제2조 (정의)">
        <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            &quot;서비스&quot;란 회사가 제공하는 공연, 전시, 클래스, 팬미팅,
            스포츠 경기 등 일정 기반 상품의 등록, 검색, 예매 및 관련 부가
            서비스를 의미합니다.
          </li>
          <li>
            &quot;회원&quot;이란 본 약관에 동의하고 회원가입을 완료한 자를
            의미합니다.
          </li>
          <li>
            &quot;구매자&quot;란 서비스를 통해 이벤트를 예매하는 회원을
            의미합니다.
          </li>
          <li>
            &quot;판매자&quot;란 이벤트를 등록하고 판매하는 회원을 의미합니다.
          </li>
          <li>
            &quot;티켓&quot;이란 이벤트 참여 권한을 나타내는 전자적 증표를
            의미합니다.
          </li>
          <li>
            &quot;QR 티켓&quot;이란 회사가 발급하는 전자 입장권을 의미합니다.
          </li>
          <li>
            &quot;친구&quot;란 서비스 내 친구 등록 기능을 통해 상호 연결된
            회원을 의미합니다.
          </li>
        </ol>
      </Article>

      <Article title="제3조 (약관의 게시 및 변경)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            회사는 본 약관의 내용을 회원이 쉽게 확인할 수 있도록 서비스 내에
            게시합니다.
          </li>
          <li>
            회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수
            있습니다.
          </li>
          <li>
            변경된 약관은 시행일 7일 전부터 공지하며, 회원에게 불리한 변경의
            경우 시행일 30일 전부터 공지합니다.
          </li>
        </ol>
      </Article>

      <Article title="제4조 (회원가입)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            이용자는 회사가 정한 절차에 따라 회원가입을 신청할 수 있습니다.
          </li>
          <li>회원가입 시 정확하고 최신의 정보를 제공하여야 합니다.</li>
          <li>
            다음 각 호에 해당하는 경우 회사는 회원가입을 거절하거나 사후 취소할
            수 있습니다.
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>타인의 정보를 도용한 경우</li>
              <li>허위 정보를 기재한 경우</li>
              <li>서비스 운영을 방해할 목적으로 가입한 경우</li>
              <li>기타 관련 법령에 위반되는 경우</li>
            </ul>
          </li>
        </ol>
      </Article>

      <Article title="제5조 (서비스 이용)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회원은 회사가 제공하는 서비스를 자유롭게 이용할 수 있습니다.</li>
          <li>
            회사는 서비스의 품질 향상을 위하여 일부 기능을 변경하거나 중단할 수
            있습니다.
          </li>
          <li>
            시스템 점검, 장애, 천재지변 등의 사유가 발생하는 경우 서비스 제공이
            일시적으로 제한될 수 있습니다.
          </li>
        </ol>
      </Article>

      <Article title="제6조 (이벤트 예매)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>구매자는 서비스에서 제공하는 이벤트를 예매할 수 있습니다.</li>
          <li>예매는 결제 완료 시점에 최종 확정됩니다.</li>
          <li>
            결제 과정 중 재고 부족, 시스템 오류 등의 사유가 발생할 경우 예매가
            취소될 수 있습니다.
          </li>
          <li>
            회사는 부정 예매 방지를 위해 구매 수량 제한을 적용할 수 있습니다.
          </li>
        </ol>
      </Article>

      <Article title="제7조 (QR 티켓 및 입장)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>예매가 완료된 회원에게 QR 티켓이 발급됩니다.</li>
          <li>QR 티켓은 해당 이벤트의 입장 권한을 나타냅니다.</li>
          <li>이미 사용된 QR 티켓은 재사용할 수 없습니다.</li>
          <li>
            QR 티켓의 위조, 변조 또는 무단 사용이 확인될 경우 입장이 제한될 수
            있습니다.
          </li>
        </ol>
      </Article>

      <Article title="제8조 (티켓 공유)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            회원은 서비스 내 친구 기능을 이용하여 티켓을 무료로 공유할 수
            있습니다.
          </li>
          <li>티켓 공유는 회사가 제공하는 기능을 통해서만 가능합니다.</li>
          <li>공유받은 티켓은 재공유할 수 없습니다.</li>
          <li>티켓의 유상 양도 및 재판매는 금지됩니다.</li>
          <li>
            회사는 암표 거래 또는 부정 거래가 의심되는 경우 이용을 제한할 수
            있습니다.
          </li>
        </ol>
      </Article>

      <Article title="제9조 (환불 및 취소)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회원은 이벤트 시작 전까지 예매 취소를 신청할 수 있습니다.</li>
          <li>환불 기준은 회사의 환불 정책에 따릅니다.</li>
          <li>
            이벤트 주최자의 사정으로 이벤트가 취소되는 경우 회사는 환불 절차를
            안내합니다.
          </li>
        </ol>
      </Article>

      <Article title="제10조 (회원의 의무)">
        <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>타인의 개인정보 도용</li>
          <li>허위 정보 등록</li>
          <li>서비스 운영 방해 행위</li>
          <li>자동화 프로그램(매크로) 사용</li>
          <li>다중 계정을 이용한 부정 예매</li>
          <li>티켓 암표 거래</li>
          <li>법령 또는 공공질서에 반하는 행위</li>
        </ul>
      </Article>

      <Article title="제11조 (판매자의 의무)">
        <p>판매자는 다음 사항을 준수하여야 합니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>실제 존재하는 이벤트만 등록하여야 합니다.</li>
          <li>이벤트 관련 정보를 정확하게 제공하여야 합니다.</li>
          <li>관련 법령을 준수하여 이벤트를 운영하여야 합니다.</li>
          <li>허위 또는 과장된 정보를 게시하여서는 안 됩니다.</li>
        </ol>
      </Article>

      <Article title="제12조 (이용 제한)">
        <p>회사는 다음 각 호의 경우 회원의 서비스 이용을 제한할 수 있습니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>약관 위반</li>
          <li>부정 예매</li>
          <li>매크로 사용</li>
          <li>암표 거래</li>
          <li>서비스 운영 방해</li>
          <li>기타 법령 위반 행위</li>
        </ul>
      </Article>

      <Article title="제13조 (면책조항)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            회사는 판매자가 등록한 이벤트 정보의 정확성을 보증하지 않습니다.
          </li>
          <li>
            회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 인한 손해에
            대하여 책임을 지지 않습니다.
          </li>
          <li>
            회사는 회원 간 또는 회원과 판매자 간 발생한 분쟁에 개입하지 않으며
            관련 책임을 부담하지 않습니다.
          </li>
        </ol>
      </Article>

      <Article title="제14조 (준거법 및 관할)">
        <p>
          본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련하여 발생한
          분쟁은 대한민국 법원을 관할 법원으로 합니다.
        </p>
      </Article>

      <p className="pt-2 text-gray-500">
        부칙 — 본 약관은 2026년 6월 18일부터 시행합니다.
      </p>
    </div>
  );
}
