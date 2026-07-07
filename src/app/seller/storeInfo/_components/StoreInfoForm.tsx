"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import Button from "@/components/Button";
import Profile from "@/components/Profile";
import type { Store } from "../types";
import Dialog from "@/components/modal/Dialog";
import useToast from "@/hooks/useToast";

const inputClass =
  "rounded-lg px-3 py-2 text-sm text-gray-900 outline-none dark:text-gray-100";

function Field({
  label,
  name,
  value,
  editing,
}: {
  label: string;
  name: string;
  value: string;
  editing: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        name={name}
        readOnly={!editing}
        defaultValue={value}
        className={`${inputClass} ${
          editing
            ? "border border-gray-200 bg-white focus:border-primary-500"
            : "border border-transparent bg-gray-50"
        } ${
          editing
            ? "dark:border-surface-3 dark:bg-surface-2 dark:focus:border-gray-500"
            : "dark:bg-surface-2"
        }`}
      />
    </div>
  );
}

interface StoreInfoFormProps {
  store: Store | null;
  storeName: string;
  userEmail: string;
}

export default function StoreInfoForm({
  store,
  storeName,
  userEmail,
}: StoreInfoFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankName, setBankName] = useState(store?.bank_name ?? "");
  const [bankAccount, setBankAccount] = useState(
    store?.bank_account_number ?? "",
  );
  const [bankHolder, setBankHolder] = useState(store?.bank_holder_name ?? "");

  async function onSave(formData: FormData) {
    const res = await fetch("/api/seller/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: formData.get("storeName"),
        businessNumber: formData.get("businessNumber"),
        description: formData.get("description"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
      }),
    });
    if (!res.ok) {
      toast.error("저장에 실패했습니다");
      return;
    }
    router.refresh();
    setEditing(false);
    toast.success("저장했습니다");
  }

  async function onBankConfirm() {
    const res = await fetch("/api/seller/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankName,
        bankAccountNumber: bankAccount,
        bankHolderName: bankHolder,
      }),
    });
    if (!res.ok) {
      toast.error("계좌 변경에 실패했습니다");
      return;
    }
    router.refresh();
    setBankModalOpen(false);
    toast.success("정산 계좌를 변경했습니다");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">스토어 정보</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex h-fit flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
          <Profile name={storeName} email={store?.email ?? undefined} />
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {store?.created_at?.slice(0, 10)} 가입
            </p>
          </div>
        </div>

        <form
          key={editing ? "edit" : "view"}
          action={onSave}
          className="flex flex-col gap-6"
        >
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-50">기본 정보</h2>
              {!editing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outlinePrimary"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  편집 모드
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="스토어명"
                name="storeName"
                value={storeName}
                editing={editing}
              />
              <Field
                label="사업자등록번호"
                name="businessNumber"
                value={store?.business_number ?? ""}
                editing={editing}
              />
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                스토어 소개
              </label>
              <textarea
                name="description"
                readOnly={!editing}
                className={`${inputClass} min-h-24 ${
                  editing
                    ? "border border-gray-200 bg-white focus:border-primary-500"
                    : "border border-transparent bg-gray-50"
                } ${
                  editing
                    ? "dark:border-surface-3 dark:bg-surface-2 dark:focus:border-gray-500"
                    : "dark:bg-surface-2"
                }`}
                defaultValue={store?.description ?? ""}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
            <h2 className="mb-5 font-semibold text-gray-900 dark:text-gray-50">연락처</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="대표 이메일"
                name="email"
                value={store?.email ?? userEmail}
                editing={editing}
              />
              <Field
                label="고객 상담 전화"
                name="phone"
                value={store?.phone ?? ""}
                editing={editing}
              />
              <Field
                label="사업장 주소"
                name="address"
                value={store?.address ?? ""}
                editing={editing}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-surface-3 dark:bg-surface-1">
            <h2 className="mb-5 font-semibold text-gray-900 dark:text-gray-50">정산 계좌</h2>
            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-surface-2">
              <div>
                {store?.bank_account_number ? (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {store.bank_name} {store.bank_account_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      예금주 {store.bank_holder_name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    등록된 정산 계좌가 없습니다
                  </p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outlinePrimary"
                onClick={() => setBankModalOpen(true)}
              >
                변경
              </Button>
            </div>
          </section>

          {editing && (
            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                variant="outlinePrimary"
                onClick={() => setEditing(false)}
              >
                취소
              </Button>
              <Button size="sm" type="submit">
                저장
              </Button>
            </div>
          )}
        </form>
      </div>
      <Dialog
        open={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title="정산 계좌 변경"
        confirmText="변경"
        onConfirm={onBankConfirm}
        confirmDisabled={
          !bankName.trim() || !bankAccount.trim() || !bankHolder.trim()
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            새로운 정산 계좌 정보를 입력해주세요.
          </p>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-surface-2">
            <p className="text-xs text-gray-500">현재 계좌</p>

            {store?.bank_account_number ? (
              <>
                <p className="mt-1 font-medium text-gray-900 dark:text-gray-50">
                  {store.bank_name} {store.bank_account_number}
                </p>
                <p className="text-sm text-gray-500">
                  예금주 {store.bank_holder_name}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                등록된 정산 계좌가 없습니다
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                은행명
              </label>

              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="은행명을 입력하세요"
                className={`${inputClass} w-full border border-gray-200 focus:border-primary-500 dark:border-surface-3 dark:bg-surface-2 dark:placeholder:text-gray-500 dark:focus:border-gray-500`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                계좌번호
              </label>

              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="계좌번호를 입력하세요"
                className={`${inputClass} w-full border border-gray-200 focus:border-primary-500 dark:border-surface-3 dark:bg-surface-2 dark:placeholder:text-gray-500 dark:focus:border-gray-500`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                예금주
              </label>

              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="예금주명을 입력하세요"
                className={`${inputClass} w-full border border-gray-200 focus:border-primary-500 dark:border-surface-3 dark:bg-surface-2 dark:placeholder:text-gray-500 dark:focus:border-gray-500`}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
