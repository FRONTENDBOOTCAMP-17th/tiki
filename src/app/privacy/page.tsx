import PrivacyContent from "@/components/policies/PrivacyContent";

export const metadata = {
  title: "개인정보 처리방침 | TiKi",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        개인정보 처리방침
      </h1>
      <PrivacyContent />
    </main>
  );
}
