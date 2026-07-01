import TermsContent from "@/components/policies/TermsContent";
import PolicyDocumentNav from "../_components/PolicyDocumentNav";

export const metadata = { title: "서비스 이용약관" };

// 서비스 이용약관 페이지(정책 문서 네비게이션 추가)
export default function TermsPage() {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
        서비스 이용약관
      </h2>
      <PolicyDocumentNav activeHref="/info/terms" />
      <TermsContent />
    </section>
  );
}
