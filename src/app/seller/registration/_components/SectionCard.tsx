export default function SectionCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#3c4043] dark:bg-[#2a2b2f]">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}
