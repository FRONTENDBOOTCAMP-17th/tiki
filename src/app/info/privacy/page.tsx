import PrivacyContent from "@/components/policies/PrivacyContent";
import PolicyDocumentNav from "../_components/PolicyDocumentNav";

export const metadata = { title: "개인정보 처리방침" };

// 개인정보 처리방침 페이지(정책 문서 네비게이션 추가)
export default function PrivacyPage() {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
        개인정보 처리방침
      </h2>
      <PolicyDocumentNav activeHref="/info/privacy" />
      <PrivacyContent />
    </section>
  );
}
