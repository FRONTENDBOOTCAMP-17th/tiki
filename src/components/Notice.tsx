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
    <div className="w-full h-fit bg-gradient p-5 rounded-xl flex flex-col gap-3 md:p-8 md:rounded-2xl md:gap-4">
      <h1 className="text-lg font-bold md:text-2xl">{title}</h1>
      {list.length ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pl-5 list-disc text-sm text-gray-500 md:text-base">
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 md:text-base">{description}</p>
      )}
    </div>
  );
}
