import type { WritableReviewSlot } from "@/lib/event/queries";
import ReviewComposerForm from "./ReviewComposerForm";

interface Props {
  eventId: string;
  slots: WritableReviewSlot[];
}

export default function ReviewComposer({ eventId, slots }: Props) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-[#3c4043] dark:bg-[#2a2b2f]">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 dark:border-[#3c4043] sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">
          후기 작성
        </h2>
        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-[#303134] dark:text-gray-300">
          작성 가능 {slots.length}
        </span>
      </div>

      <ReviewComposerForm eventId={eventId} slots={slots} />
    </section>
  );
}
