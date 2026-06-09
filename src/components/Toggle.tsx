interface ToggleProps {
  name: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

export default function Toggle({
  name,
  title,
  description,
  defaultChecked = false,
}: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm text-gray-400">{description}</p>
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-purple-500" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}