"use client";

import { useEffect, useState } from "react";

const BUILD = (process.env.NEXT_PUBLIC_BUILD_ID || "dev").slice(0, 7);

export function SystemStatus() {
  const [time, setTime] = useState<string>("--:--:--");
  const [online, setOnline] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const t = d.toLocaleTimeString(undefined, { hour12: false });
      setTime(t);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Lightweight latency probe to the backend health endpoint, every 30s.
  useEffect(() => {
    let cancelled = false;
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
      "http://localhost:8000/api";

    async function ping() {
      const t0 = performance.now();
      try {
        const res = await fetch(`${base}/health`, { cache: "no-store" });
        if (!cancelled) {
          if (res.ok) setLatency(Math.round(performance.now() - t0));
          else setLatency(null);
        }
      } catch {
        if (!cancelled) setLatency(null);
      }
    }
    ping();
    const id = setInterval(ping, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="hidden shrink-0 items-center gap-3 whitespace-nowrap font-mono text-[11px] text-ink-300 xl:flex">
      <span className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            online ? "bg-accent-green" : "bg-amber-400"
          }`}
          style={{
            boxShadow: online
              ? "0 0 8px rgba(74,222,128,0.8)"
              : "0 0 8px rgba(251,191,36,0.7)",
          }}
        />
        <span className="text-ink-200">{online ? "online" : "offline"}</span>
        {latency !== null && (
          <span className="tabular-nums text-ink-300">
            · <span className={latency < 120 ? "text-accent-soft" : "text-amber-300"}>{latency}ms</span>
          </span>
        )}
      </span>
      <span className="text-ink-400">|</span>
      <span>
        <span className="text-ink-300">main</span>
        <span className="mx-1">·</span>
        <span>{BUILD}</span>
      </span>
      <span className="text-ink-400">|</span>
      <span className="tabular-nums text-ink-200">{time}</span>
    </div>
  );
}
