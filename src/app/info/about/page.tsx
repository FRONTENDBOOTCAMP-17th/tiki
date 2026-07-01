import AboutContent from "./AboutContent";

export const metadata = { title: "서비스 소개" };

// 서비스 소개 페이지(AboutContent로 소개 본문 렌더링하도록 수정)
export default function AboutPage() {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
        서비스 소개
      </h2>
      <AboutContent />
    </section>
  );
}
