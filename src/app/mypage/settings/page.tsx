import InfoLinkButton from "@/components/mypage/InfoLinkButton";
import PasswordChangeButton from "@/components/mypage/PasswordChangeButton";
import WithdrawButton from "@/components/mypage/WithdrawButton";
import TermsContent from "@/components/policies/TermsContent";
import PrivacyContent from "@/components/policies/PrivacyContent";
import NotificationSettings from "@/components/mypage/NotificationSettings";
import { getNotificationSettings } from "@/lib/mypage/notificationSettings";

export default async function SettingsPage() {
  const notif = await getNotificationSettings();

  return (
    <div className="flex flex-col gap-6">
      {/* 설정 카드 */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900">
          설정
        </h1>

        <div className="mt-6 flex flex-col gap-8">
          {/* 알림 설정 */}
          <NotificationSettings initial={notif} />

          {/* 개인정보 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">개인정보</h2>
            <InfoLinkButton label="개인정보 처리방침" title="개인정보 처리방침">
              <PrivacyContent />
            </InfoLinkButton>
            <InfoLinkButton label="서비스 이용약관" title="서비스 이용약관">
              <TermsContent />
            </InfoLinkButton>
          </div>

          {/* 계정 관리 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">계정 관리</h2>
            <PasswordChangeButton />
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
