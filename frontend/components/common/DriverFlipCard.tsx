"use client";

import { useMemo, useState } from "react";

export type DriverStats = {
  championships: number;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  first_season?: number | null;
  last_season?: number | null;
};

export type DriverApiRow = {
  code: string;
  name: string;
  portrait_url?: string | null;
  stats: DriverStats;
};

type Props = {
  driver: DriverApiRow;
  className?: string;
  accent?: string; // opcionális kiemelő szín
  fallbackPortraitUrl?: string;
};

function formatPoints(v: number) {
  // nem erőltetek túl sok decimált, csak ha kell
  const isInt = Math.abs(v - Math.round(v)) < 1e-9;
  return isInt ? String(Math.round(v)) : v.toFixed(1);
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DriverFlipCard({
  driver,
  className = "",
  accent = "#e10600",
  fallbackPortraitUrl = "/drivers/default.jpg",
}: Props) {
  const [flipped, setFlipped] = useState(false);

  const portrait = driver.portrait_url || fallbackPortraitUrl;

  const seasonText = useMemo(() => {
    const a = driver.stats.first_season;
    const b = driver.stats.last_season;
    if (!a && !b) return "—";
    if (a && !b) return `${a}–`;
    if (!a && b) return `–${b}`;
    return `${a}–${b}`;
  }, [driver.stats.first_season, driver.stats.last_season]);

  const statsList = useMemo(
    () => [
      { label: "World titles", value: driver.stats.championships },
      { label: "Total points", value: formatPoints(driver.stats.points ?? 0) },
      { label: "Wins", value: driver.stats.wins },
      { label: "Podiums", value: driver.stats.podiums },
      { label: "Poles", value: driver.stats.poles },
      { label: "Seasons", value: seasonText },
    ],
    [driver.stats, seasonText]
  );

  return (
    <div
      className={`group relative h-[340px] w-[260px] select-none ${className}`}
      style={{ perspective: "1200px" }}
      role="button"
      tabIndex={0}
      aria-label={`${driver.name} card`}
      onClick={() => setFlipped((v) => !v)} // mobil: tap
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setFlipped((v) => !v);
      }}
    >
      <div
        className={[
          "relative h-full w-full transition-transform duration-700",
          "[transform-style:preserve-3d]",
          "group-hover:[transform:rotateY(180deg)]",
          flipped ? "[transform:rotateY(180deg)]" : "",
        ].join(" ")}
      >
        {/* FRONT */}
        <div
          className={[
            "absolute inset-0 overflow-hidden rounded-2xl border border-white/10",
            "bg-gradient-to-b from-white/5 to-black/20",
            "shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
            "[backface-visibility:hidden]",
          ].join(" ")}
        >
          {/* Accent bar */}
          <div
            className="absolute left-0 top-0 h-1 w-full opacity-90"
            style={{ background: accent }}
          />

          {/* Image */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt={driver.name}
              className="h-full w-full object-cover"
              draggable={false}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackPortraitUrl;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
          </div>

          {/* Top badges */}
          <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
            <div
              className="rounded-full px-3 py-1 text-xs font-semibold tracking-wider text-white"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              title="Driver key"
            >
              {driver.code}
            </div>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              title={driver.name}
            >
              {initials(driver.name)}
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-lg font-semibold leading-tight text-white">
              {driver.name}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-white/70">Hover / tap for stats</div>

              <div
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                🏆 {driver.stats.championships}
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className={[
            "absolute inset-0 overflow-hidden rounded-2xl border border-white/10",
            "bg-gradient-to-b from-black/35 to-black/75",
            "shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
            "[transform:rotateY(180deg)]",
            "[backface-visibility:hidden]",
          ].join(" ")}
        >
          <div
            className="absolute left-0 top-0 h-1 w-full opacity-90"
            style={{ background: accent }}
          />

          {/* Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold text-white">
                  {driver.name}
                </div>
                <div className="text-sm text-white/60">{driver.code}</div>
              </div>

              <div
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                All-time
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {statsList.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="text-sm text-white/70">{s.label}</div>
                  <div className="text-sm font-semibold text-white">
                    {s.value as any}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-white/45">
              Desktop: hover • Mobile: tap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}