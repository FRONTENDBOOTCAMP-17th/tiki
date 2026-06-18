export default function SectionCard({
  step,
  title,
  desc,
  children,
}: {
  step: number;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return ( // 이벤트 등록에서 각 카드 섹션 나눠놓은 화면입니다
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
