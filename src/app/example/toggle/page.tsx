import Toggle from "@/components/Toggle";

export default function SettingsPage() {
  return (
    <section className="px-5 py-6">
      <div className="mb-5">
        <h3 className="font-semibold text-gray-900">알림 설정</h3>
        <p className="mt-1 text-sm text-gray-500">
          받고 싶은 알림을 선택하세요.
        </p>
      </div>

      <div className="space-y-4">
        <Toggle
          name="friendRequest"
          title="친구 신청 알림"
          description="친구 신청 알림을 받습니다."
          defaultChecked
        />
        <Toggle
          name="eventStart"
          title="이벤트 시작 알림"
          description="공연 시작 1시간 전 알림을 받습니다."
          defaultChecked
        />
        <Toggle
          name="marketing"
          title="마케팅 알림"
          description="이벤트 및 프로모션 정보를 받습니다."
        />
      </div>
    </section>
  );
}