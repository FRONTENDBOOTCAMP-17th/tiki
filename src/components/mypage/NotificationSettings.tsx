"use client";
import { useState, useTransition } from "react";
import Toggle from "@/components/Toggle";
import {
  updateNotificationSettings,
  type NotificationSettings as Settings,
} from "@/lib/mypage/notificationSettings";

const ITEMS: { key: keyof Settings; title: string; description: string }[] = [
  {
    key: "friend",
    title: "친구 신청 알림",
    description: "친구 신청 알림을 받습니다",
  },
  {
    key: "event",
    title: "이벤트 시작 알림",
    description: "공연 시작 1시간 전 알림을 받습니다",
  },
  {
    key: "marketing",
    title: "마케팅 알림",
    description: "이벤트 및 프로모션 정보를 받습니다",
  },
];

export default function NotificationSettings({
  initial,
}: {
  initial: Settings;
}) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof Settings, value: boolean) => {
    // 낙관적 갱신 후 저장, 실패 시 롤백
    const prev = settings;
    const next = { ...settings, [key]: value };
    setSettings(next);
    startTransition(async () => {
      const res = await updateNotificationSettings({ [key]: value });
      if (!res.ok) {
        setSettings(prev);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500">알림 설정</h2>
        {saved && (
          <span className="text-xs font-medium text-primary-600">저장됨</span>
        )}
      </div>
      {ITEMS.map((item) => (
        <Toggle
          key={item.key}
          name={item.key}
          title={item.title}
          description={item.description}
          checked={settings[item.key]}
          onChange={(v) => handleToggle(item.key, v)}
        />
      ))}
    </div>
  );
}
