interface Props {
  status: string;
}

export default function EventStatusBadge({ status }: Props) {
  const open = status === "공개";
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
        open
          ? "border-primary-200 bg-primary-50 text-primary-700"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}
