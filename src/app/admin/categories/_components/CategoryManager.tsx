"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderCategories } from "../actions";

interface Category {
  category_id: string;
  category_name: string;
  slug: string;
  icon_key: string;
  display_order: number;
  is_active: boolean;
  eventCount: number;
}

function SortableRow({ category, index }: { category: Category; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.category_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 bg-white dark:border-surface-3 dark:bg-surface-1 ${isDragging ? "shadow-lg" : "hover:bg-gray-50/50 dark:hover:bg-surface-2"}`}
    >
      <td className="w-10 px-4 py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical size={18} />
        </button>
      </td>
      <td className="w-16 px-4 py-4 text-gray-400">{index + 1}</td>
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-50">
        {category.category_name}
      </td>
      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
        {category.eventCount}개
      </td>
    </tr>
  );
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.category_id === active.id);
    const newIndex = categories.findIndex((c) => c.category_id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);

    setCategories(reordered);

    startTransition(async () => {
      await reorderCategories(
        reordered.map((c, i) => ({ categoryId: c.category_id, displayOrder: i + 1 })),
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-600">
        <GripVertical size={15} className="shrink-0" />
        드래그하여 카테고리 순서를 변경할 수 있습니다.
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-surface-3 dark:bg-surface-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.category_id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-surface-3 dark:text-gray-400">
                  <th className="w-10 px-4 py-3.5" />
                  <th className="w-16 px-4 py-3.5 font-medium">순서</th>
                  <th className="px-4 py-3.5 font-medium">카테고리명</th>
                  <th className="px-4 py-3.5 font-medium">이벤트 수</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <SortableRow key={cat.category_id} category={cat} index={index} />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>

        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400 dark:border-surface-3">
          총 {categories.length}개
        </div>
      </div>
    </div>
  );
}
