interface NoticeProps {
  title?: string;
  description?: string;
  list?: string[];
}

export default function Notice({
  title = "",
  description = "",
  list = [],
}: NoticeProps) {
  {
    /* list인 경우 ul로 나열 */
  }
  {
    /* description인 경우 텍스트로 배치 */
  }
  return (
    <div className="flex h-fit w-full flex-col gap-3 rounded-xl bg-gradient p-5 md:gap-4 md:rounded-2xl md:p-8 dark:border dark:border-surface-3 dark:bg-none dark:bg-surface-1">
      <h1 className="text-lg font-bold dark:text-gray-50 md:text-2xl">{title}</h1>
      {list.length ? (
        <ul className="grid list-disc grid-cols-1 gap-1 pl-5 text-sm text-gray-500 md:grid-cols-2 md:text-base lg:grid-cols-1 dark:text-gray-300">
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 md:text-base dark:text-gray-300">{description}</p>
      )}
    </div>
  );
}
