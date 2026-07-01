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
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { reorderCategories, updateCategory, deleteCategory } from "../actions";

interface Category {
  category_id: string;
  category_name: string;
  slug: string;
  icon_key: string;
  display_order: number;
  is_active: boolean;
  eventCount: number;
}

function SortableRow({
  category,
  index,
  onEdit,
  onDelete,
  isPendingDelete,
}: {
  category: Category;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string, count: number) => void;
  isPendingDelete: boolean;
}) {
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
      className={`border-b border-gray-100 bg-white dark:border-[#3c4043] dark:bg-[#2a2b2f] ${isDragging ? "shadow-lg" : "hover:bg-gray-50/50 dark:hover:bg-[#303134]"}`}
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
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onEdit(category.category_id)}
            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-700"
          >
            <Pencil size={13} />
            수정
          </button>
          <button
            onClick={() => onDelete(category.category_id, category.eventCount)}
            disabled={isPendingDelete}
            className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-40"
          >
            <Trash2 size={13} />
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

function EditRow({
  category,
  onSave,
  onCancel,
  isPending,
}: {
  category: Category;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <tr className="border-b border-primary-100 bg-primary-50/30 dark:border-[#3c4043] dark:bg-[#303134]">
      <td className="w-10 px-4 py-3" />
      <td className="w-16 px-4 py-3 text-gray-400">{category.display_order}</td>
      <td className="px-4 py-3" colSpan={2}>
        <form
          action={onSave}
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(new FormData(e.currentTarget));
          }}
        >
          <input type="hidden" name="categoryId" value={category.category_id} />
          <input
            name="name"
            defaultValue={category.category_name}
            autoFocus
            required
            className="rounded-lg border border-primary-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-primary-400 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            <Check size={13} />
            저장
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-[#3c4043] dark:text-gray-300 dark:hover:bg-[#34363a]"
          >
            <X size={13} />
            취소
          </button>
        </form>
      </td>
      <td className="px-4 py-3" />
    </tr>
  );
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateCategory(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        const id = String(formData.get("categoryId"));
        const name = String(formData.get("name"));
        setCategories((prev) =>
          prev.map((c) => (c.category_id === id ? { ...c, category_name: name } : c)),
        );
        setEditingId(null);
      }
    });
  }

  function handleDelete(categoryId: string, eventCount: number) {
    if (eventCount > 0) {
      alert(`이벤트 ${eventCount}개가 사용 중인 카테고리는 삭제할 수 없습니다.`);
      return;
    }
    if (!confirm("카테고리를 삭제하시겠습니까?")) return;

    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (result?.error) {
        alert(result.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.category_id !== categoryId));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-600">
        <GripVertical size={15} className="shrink-0" />
        드래그하여 카테고리 순서를 변경할 수 있습니다.
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#3c4043] dark:bg-[#2a2b2f]">
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
                <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-[#3c4043] dark:text-gray-400">
                  <th className="w-10 px-4 py-3.5" />
                  <th className="w-16 px-4 py-3.5 font-medium">순서</th>
                  <th className="px-4 py-3.5 font-medium">카테고리명</th>
                  <th className="px-4 py-3.5 font-medium">이벤트 수</th>
                  <th className="px-4 py-3.5 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) =>
                  editingId === cat.category_id ? (
                    <EditRow
                      key={cat.category_id}
                      category={cat}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                      isPending={isPending}
                    />
                  ) : (
                    <SortableRow
                      key={cat.category_id}
                      category={cat}
                      index={index}
                      onEdit={setEditingId}
                      onDelete={handleDelete}
                      isPendingDelete={isPending}
                    />
                  ),
                )}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>

        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400 dark:border-[#3c4043]">
          총 {categories.length}개
        </div>
      </div>
    </div>
  );
}
