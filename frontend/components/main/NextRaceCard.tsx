"use client";

import { useEffect, useMemo, useState } from "react";

type NextRace = {
  name: string;
  startTimeUtc: string; // pl. "2026-03-15T14:00:00Z"
};

function formatRemaining(ms: number) {
  if (ms <= 0) return "LIVE / STARTED";

  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export default function NextRaceCard() {
  const [race, setRace] = useState<NextRace | null>(null);
  const [error, setError] = useState<string>("");
  const [now, setNow] = useState<number>(() => Date.now());

  // amikor sikeresen betöltöttük az adatot, elmentjük "onnantól" a startot
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [initialRemainingMs, setInitialRemainingMs] = useState<number | null>(null);

  // fetch once
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/next-race");
        if (!res.ok) {
          setError(`Backend error: ${res.status}`);
          return;
        }

        const data: NextRace = await res.json();
        setRace(data);

        // progress alap: betöltés pillanata + akkor hátralévő idő
        const startMs = Date.parse(data.startTimeUtc);
        if (!Number.isNaN(startMs)) {
          const tNow = Date.now();
          setLoadedAt(tNow);
          setInitialRemainingMs(Math.max(0, startMs - tNow));
        }
      } catch {
        setError("Connection error");
      }
    };

    load();
  }, []);

  // tick every second
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startMs = useMemo(() => {
    if (!race?.startTimeUtc) return null;
    const t = Date.parse(race.startTimeUtc);
    return Number.isNaN(t) ? null : t;
  }, [race?.startTimeUtc]);

  const remainingMs = useMemo(() => {
    if (!startMs) return null;
    return startMs - now;
  }, [startMs, now]);

  const remainingText = useMemo(() => {
    if (remainingMs === null) return "—";
    return formatRemaining(remainingMs);
  }, [remainingMs]);

  const startLocal = useMemo(() => {
    if (!startMs) return "";
    return new Intl.DateTimeFormat("hu-HU", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(startMs));
  }, [startMs]);

  // Progress: 0 -> 1 ahogy közeledik a starthoz a betöltés óta
  const progress = useMemo(() => {
    if (!startMs || !loadedAt || initialRemainingMs === null) return 0;

    // ha már élő, legyen 1
    if (now >= startMs) return 1;

    const elapsed = now - loadedAt;
    const p = elapsed / Math.max(1, initialRemainingMs);
    return clamp01(p);
  }, [startMs, loadedAt, initialRemainingMs, now]);

  return (
    <div className="f1-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-2)] tracking-widest">NEXT RACE</p>
          <h2 className="text-xl font-semibold mt-1">
            {race?.name ?? "Loading…"}
          </h2>
          <p className="text-sm text-[var(--text-1)] mt-1">
            {startLocal || "—"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="f1-badge">
            {error ? "ERROR" : startMs ? remainingText : "—"}
          </span>

          {error && <span className="text-xs text-red-400">{error}</span>}
          {!error && startMs && remainingMs !== null && remainingMs <= 0 && (
            <span className="text-xs text-[var(--accent)]">Race window started</span>
          )}
        </div>
      </div>   
    </div>
  );
}