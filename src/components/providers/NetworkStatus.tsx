"use client";

import { useEffect, useState } from "react";

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-[1100] bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-[#422006]">
      Bạn đang ngoại tuyến. Một số thao tác sẽ tiếp tục khi kết nối được khôi phục.
    </div>
  );
}
