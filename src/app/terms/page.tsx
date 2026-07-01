import TermsContent from "@/components/policies/TermsContent";

export const metadata = {
  title: "서비스 이용약관 | TiKi",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        서비스 이용약관
      </h1>
      <TermsContent />
    </main>
  );
}
