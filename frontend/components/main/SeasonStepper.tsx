"use client";

import { useEffect, useState } from "react";

type Props = {
  year: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
};

function clampYear(y: number, minY: number, maxY: number) {
  if (y < minY) return minY;
  if (y > maxY) return maxY;
  return y;
}

export default function SeasonStepper({
  year,
  onChange,
  minYear = 1950,
  maxYear = 2026,
}: Props) {
  const [draft, setDraft] = useState<string>(String(year));

  // ha külső year változik (nyilak / parent), frissítjük az inputot is
  useEffect(() => {
    setDraft(String(year));
  }, [year]);

  const canPrev = year > minYear;
  const canNext = year < maxYear;

  const prev = () => {
    if (canPrev) onChange(year - 1);
  };

  const next = () => {
    if (canNext) onChange(year + 1);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(String(year));
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setDraft(String(year));
      return;
    }

    const clamped = clampYear(parsed, minYear, maxYear);
    onChange(clamped);
    setDraft(String(clamped));
  };

  return (
    <div
      className="f1-glass rounded-xl border px-2 py-2 flex items-center gap-2"
      style={{ borderColor: "rgba(255,255,255,0.12)" }}
    >
      <button
        onClick={prev}
        disabled={!canPrev}
        className="f1-btn px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous year"
        title="Previous year"
      >
        ←
      </button>

      <div
        className="rounded-lg border px-2 py-1"
        style={{
          borderColor: "rgba(182,255,46,0.25)",
          background: "rgba(182,255,46,0.08)",
        }}
      >
        <input
          value={draft}
          onChange={(e) => {
            // csak számjegyeket hagyunk (megengedjük az üreset is)
            const v = e.target.value.replace(/[^\d]/g, "");
            setDraft(v);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setDraft(String(year));
          }}
          inputMode="numeric"
          className="bg-transparent outline-none text-center font-semibold text-sm"
          style={{ width: 84, color: "var(--text-0)" }}
          aria-label="Season year"
        />
      </div>

      <button
        onClick={next}
        disabled={!canNext}
        className="f1-btn px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next year"
        title="Next year"
      >
        →
      </button>
    </div>
  );
}
