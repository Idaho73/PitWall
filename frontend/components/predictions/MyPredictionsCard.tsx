"use client";

import { useEffect, useMemo, useState } from "react";
import { GP_ROUNDS } from "@/public/gpRounds";

type MyPrediction = {
  id: number;
  year: number;
  round: number;
  identifier: "R" | "S" | string;
  first: string;
  second: string;
  third: string;
};

type Props = {
  className?: string;
};

export default function MyPredictionsCard({ className = "" }: Props) {
  const [rows, setRows] = useState<MyPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/predictions/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail ?? data?.message ?? `Failed: ${res.status}`);
      }

      const data = (await res.json()) as MyPrediction[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load predictions");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const roundLabel = (round: number) => {
    const gp = GP_ROUNDS.find((g: any) => g.round === round);
    return gp?.label ?? `Round ${round}`;
  };

  const sorted = useMemo(() => {
    // Legújabb felül: year desc, round desc, identifier (R előre)
    return [...rows].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.round !== b.round) return b.round - a.round;
      const ai = a.identifier === "R" ? 0 : 1;
      const bi = b.identifier === "R" ? 0 : 1;
      return ai - bi;
    });
  }, [rows]);

  return (
    <div className={`f1-panel ${className}`}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">My predictions</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="f1-btn h-[38px] px-3 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="my-4 h-px w-full f1-divider border-t" />

        {loading ? (
          <div className="f1-glass rounded-[14px] border border-[var(--line)] p-4">
            <p className="text-sm" style={{ color: "var(--text-1)" }}>
              Loading…
            </p>
          </div>
        ) : error ? (
          <div className="f1-error">
            {error}
          </div>
        ) : sorted.length === 0 ? (
          <div className="f1-glass rounded-[14px] border border-[var(--line)] p-4">
            <p className="text-sm" style={{ color: "var(--text-1)" }}>
              No predictions yet.
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-2)" }}>
              Submit one above and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((p) => (
              <div
                key={p.id}
                className="f1-glass rounded-[14px] border border-[var(--line)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-0)" }}>
                        {roundLabel(p.round)}
                      </span>

                      <span
                        className="rounded-full border px-2 py-0.5 text-xs"
                        style={{
                          borderColor: "rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.04)",
                          color: "var(--text-1)",
                        }}
                      >
                        {p.year}
                      </span>

                      <span className="f1-badge">
                        {p.identifier === "R" ? "Race" : "Sprint"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <PickPill place="1" code={p.first} />
                  <PickPill place="2" code={p.second} />
                  <PickPill place="3" code={p.third} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PickPill({ place, code }: { place: string; code: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "var(--text-0)",
      }}
    >
      <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
        {place}
      </span>
      <span className="font-semibold">{code}</span>
    </div>
  );
}
