import { MapPin } from "lucide-react";
import VenueMapClient from "./VenueMapClient";

interface VenueMapProps {
  address: string;
  detailAddress?: string;
}

function VenueMapShell({
  fullAddress,
  message,
}: {
  fullAddress: string;
  message: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2 px-4 text-center text-sm font-medium text-gray-400">
        <MapPin className="h-6 w-6 text-gray-300" aria-hidden="true" />
        <span>{message}</span>
      </div>
      {fullAddress && (
        <a
          href={`https://map.kakao.com/link/search/${encodeURIComponent(fullAddress)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3 text-sm transition-colors hover:bg-gray-50"
        >
          <span className="truncate text-gray-600">{fullAddress}</span>
          <span className="shrink-0 font-semibold text-primary-700">
            카카오맵
          </span>
        </a>
      )}
    </div>
  );
}

export default function VenueMap({ address, detailAddress }: VenueMapProps) {
  const fullAddress = [address, detailAddress].filter(Boolean).join(" ");
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  if (!address) {
    return (
      <VenueMapShell
        fullAddress={fullAddress}
        message="주소를 지도에서 찾지 못했습니다."
      />
    );
  }

  if (!appKey) {
    return (
      <VenueMapShell
        fullAddress={fullAddress}
        message="지도 API 키를 설정해 주세요."
      />
    );
  }

  return (
    <VenueMapClient
      address={address}
      fullAddress={fullAddress}
      appKey={appKey}
    />
  );
}
