// 홈 화면 최상단 배너. 캠페인성 콘텐츠라 우선 정적 슬로건으로 채우고,
// 추후 운영 배너 데이터가 생기면 props로 받아 교체하면 된다.
export default function HeroBanner() {
  return (
    <section className="bg-gradient px-4 py-10 text-center md:px-8 lg:py-16">
      <p className="text-sm font-medium text-primary-700">TIKI와 함께하는 첫 줄</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-4xl">
        보고싶던 그 공연, 지금 예매하세요
      </h1>
    </section>
  );
}
