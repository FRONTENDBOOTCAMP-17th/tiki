export default function MobileProfileCard() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:hidden">
      <div className="size-16 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
      <p className="text-lg font-bold text-gray-900">티키님</p>
      <p className="text-sm text-gray-400">tiki@gmail.com</p>
      <span className="rounded-full bg-primary-100 px-3 py-0.5 text-xs font-medium text-primary-700">
        구매자
      </span>
    </div>
  );
}
