"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

type KakaoLatLng = unknown;
type KakaoMap = unknown;

type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMap;
  Marker: new (options: { map: KakaoMap; position: KakaoLatLng }) => unknown;
  services: {
    Status: { OK: string };
    Geocoder: new () => {
      addressSearch: (
        address: string,
        callback: (
          result: { x: string; y: string; address_name?: string }[],
          status: string,
        ) => void,
      ) => void;
    };
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

let kakaoMapScriptPromise: Promise<void> | null = null;

function loadKakaoMapScript(appKey: string) {
  if (window.kakao?.maps?.services) return Promise.resolve();
  if (kakaoMapScriptPromise) return kakaoMapScriptPromise;

  kakaoMapScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      "kakao-map-sdk",
    ) as HTMLScriptElement | null;

    const resolveWhenReady = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao maps SDK is not available."));
        return;
      }

      window.kakao.maps.load(resolve);
    };

    if (existingScript) {
      existingScript.addEventListener("load", resolveWhenReady, { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.addEventListener("load", resolveWhenReady, { once: true });
    script.addEventListener("error", () => reject(), { once: true });
    document.head.appendChild(script);
  });

  return kakaoMapScriptPromise;
}

interface VenueMapClientProps {
  address: string;
  fullAddress: string;
  appKey: string;
}

export default function VenueMapClient({
  address,
  fullAddress,
  appKey,
}: VenueMapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "not-found" | "error">(
    "idle",
  );

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    let cancelled = false;

    loadKakaoMapScript(appKey)
      .then(() => {
        if (cancelled || !window.kakao?.maps || !mapRef.current) return;

        const { maps } = window.kakao;
        const geocoder = new maps.services.Geocoder();

        geocoder.addressSearch(address, (result, geocodeStatus) => {
          if (cancelled || !mapRef.current) return;

          if (geocodeStatus !== maps.services.Status.OK || !result[0]) {
            setStatus("not-found");
            return;
          }

          const position = new maps.LatLng(
            Number(result[0].y),
            Number(result[0].x),
          );
          const map = new maps.Map(mapRef.current, {
            center: position,
            level: 3,
          });
          new maps.Marker({ map, position });
          setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [address, appKey]);

  const message =
    status === "not-found"
      ? "주소를 지도에서 찾지 못했습니다."
      : status === "error"
        ? "지도를 불러오지 못했습니다."
        : "지도를 불러오는 중입니다.";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <div className="relative h-64 w-full">
        <div
          ref={mapRef}
          className="h-full w-full"
          aria-label={`${fullAddress || address} 지도`}
        />
        {status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 px-4 text-center text-sm font-medium text-gray-400">
            <MapPin className="h-6 w-6 text-gray-300" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}
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
