export default function LabelBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return ( // 카드 안에 있는 라벨이랑 아래 자식(폼이든 뭐든) 구성해놓은 컴포넌트입니다
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
