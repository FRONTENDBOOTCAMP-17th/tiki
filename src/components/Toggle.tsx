interface ToggleProps {
  name: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
  checked?: boolean;                       // 제어 모드용
  onChange?: (checked: boolean) => void;   // 제어 모드용
}

export default function Toggle({
  name,
  title,
  description,
  defaultChecked = false,
  checked,
  onChange,
}: ToggleProps) {
  const descId = `${name}-desc`;  // description 연결용 id
  const isControlled = checked !== undefined; // checked 넘기면 제어, 아니면 비제어

  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p id={descId} className="mt-0.5 text-sm text-gray-400">{description}</p>
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          aria-describedby={descId} // 스크린리더가 title + description 같이 읽음
          className="peer sr-only"
          {...(isControlled
            ? { checked, onChange: (e) => onChange?.(e.target.checked) }
            : { defaultChecked })}
        />
        <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-primary-500" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}