"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { addCategory, updateCategory, deleteCategory } from "../actions";

interface Category {
  category_id: string;
  category_name: string;
  slug: string;
  icon_key: string;
  display_order: number;
  is_active: boolean;
  eventCount: number;
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const addFormRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await addCategory(formData);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setShowAddForm(false);
        addFormRef.current?.reset();
      }
    });
  }

  function handleUpdate(formData: FormData) {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await updateCategory(formData);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setEditingId(null);
      }
    });
  }

  function handleDelete(categoryId: string, eventCount: number) {
    if (eventCount > 0) {
      alert(`이 카테고리에 이벤트 ${eventCount}개가 사용 중입니다. 삭제할 수 없습니다.`);
      return;
    }
    if (!confirm("카테고리를 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (result.error) alert(result.error);
    });
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">카테고리 목록</h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
          >
            <Plus size={15} />
            카테고리 추가
          </button>
        </div>

        {showAddForm && (
          <form ref={addFormRef} action={handleAdd} className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <p className="mb-3 text-sm font-medium text-gray-700">새 카테고리</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input
                name="name"
                required
                placeholder="이름 (예: 콘서트)"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <input
                name="slug"
                required
                placeholder="슬러그 (예: concert)"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <input
                name="iconKey"
                placeholder="아이콘 키 (예: tag)"
                defaultValue="tag"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <input
                name="displayOrder"
                type="number"
                placeholder="정렬 순서"
                defaultValue={0}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                <Check size={14} />
                추가
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <X size={14} />
                취소
              </button>
            </div>
          </form>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">이름</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">슬러그</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">아이콘</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">순서</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">활성</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">이벤트 수</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {initialCategories.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  카테고리가 없습니다
                </td>
              </tr>
            ) : (
              initialCategories.map((cat) =>
                editingId === cat.category_id ? (
                  <tr key={cat.category_id} className="bg-blue-50">
                    <td colSpan={7} className="px-4 py-4">
                      <form action={handleUpdate}>
                        <input type="hidden" name="categoryId" value={cat.category_id} />
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                          <input
                            name="name"
                            defaultValue={cat.category_name}
                            required
                            placeholder="이름"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                          />
                          <input
                            name="slug"
                            defaultValue={cat.slug}
                            required
                            placeholder="슬러그"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                          />
                          <input
                            name="iconKey"
                            defaultValue={cat.icon_key}
                            placeholder="아이콘 키"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                          />
                          <input
                            name="displayOrder"
                            type="number"
                            defaultValue={cat.display_order}
                            placeholder="순서"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                          />
                          <select
                            name="isActive"
                            defaultValue={String(cat.is_active)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                          >
                            <option value="true">활성</option>
                            <option value="false">비활성</option>
                          </select>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                          >
                            <Check size={14} />
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                          >
                            <X size={14} />
                            취소
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat.category_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{cat.category_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.icon_key}</td>
                    <td className="px-4 py-3 text-gray-600">{cat.display_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.is_active ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cat.eventCount}개</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingId(cat.category_id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.category_id, cat.eventCount)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
          총 {initialCategories.length}개
        </div>
      </div>
    </div>
  );
}
