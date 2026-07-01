import FaqSection from "@/app/support/FaqSection";

export const metadata = { title: "자주 묻는 질문" };

export default function FaqPage() {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
        자주 묻는 질문
      </h2>
      <FaqSection showTitle={false} />
    </section>
  );
}
