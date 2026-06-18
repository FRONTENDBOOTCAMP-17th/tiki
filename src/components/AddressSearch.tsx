"use client";

import { useState } from "react";
import DaumPostcodeEmbed, { type Address } from "react-daum-postcode";
import Button from "@/components/Button";
import Dialog from "@/components/modal/Dialog";

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
  name?: string; // form 띄우기용 이름입니다
  placeholder?: string;
}

export default function AddressSearch({
  value,
  onChange,
  name,
  placeholder = "주소 검색을 눌러주세요",
}: AddressSearchProps) {
  const [open, setOpen] = useState(false);

  const onComplete = (data: Address) => {
    onChange(data.address);
    setOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <input
          name={name}
          value={value}
          readOnly
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500"
        />
        <Button
          type="button"
          size="sm"
          variant="outlinePrimary"
          onClick={() => setOpen(true)}
        >
          주소 검색
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="주소 검색"
        showCancel={false}
        confirmText="닫기"
      >
        <DaumPostcodeEmbed onComplete={onComplete} style={{ height: 460 }} />
      </Dialog>
    </>
  );
}
