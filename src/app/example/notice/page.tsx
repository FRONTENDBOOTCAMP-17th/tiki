import Notice from "@/components/Notice";

export default function NoticePage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* 일반 버전 : 구석에 작게 들어갈거라 일부러 width:100% 속성을 줌 */}
      <div>
        <Notice
          title="서비스 준비 중입니다."
          description="빠른 시일 내에 찾아뵙겠습니다."
        />
      </div>
      <div className="flex w-1/2">
        <Notice
          title="점검 중입니다."
          description="잠시 후 다시 시도해 주세요."
        />
      </div>
      <div className="flex w-1/2">
        <Notice
          title="티켓 수량을 확인하고 구매를 진행해주세요!"
          description="남은 티켓 수량을 확인하고 있습니다"
        />
      </div>
      {/* 리스트 버전 -> 태블릿에서만 2열 배치 */}
      <div className="flex flex-col max-w-sm">
        <Notice
          title="모바일 버전"
          list={[
            "공연 시작 30분 전 입장",
            "재입장 불가",
            "취소·환불 규정 확인",
            "주차 공간 협소",
          ]}
        />
      </div>
      <div className="flex flex-col max-w-2xl">
        <Notice
          title="태블릿 버전"
          list={[
            "공연 시작 30분 전 입장",
            "재입장 불가",
            "취소·환불 규정 확인",
            "주차 공간 협소",
          ]}
        />
      </div>
      <div className="flex flex-col">
        <Notice
          title="웹 버전"
          list={[
            "공연 시작 30분 전 입장",
            "재입장 불가",
            "취소·환불 규정 확인",
            "주차 공간 협소",
            "촬영 금지",
            "음식물 반입 금지",
          ]}
        />
      </div>
    </div>
  );
}
