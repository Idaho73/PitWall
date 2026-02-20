"use client";

import { useEffect, useMemo, useState } from "react";

type LeaderboardRow = {
  username: string;
  points: number;
};

type Props = {
  year: number;
  maxHeightPx?: number;
};

export default function LeaderboardCard({ year, maxHeightPx = 310 }: Props) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/leaderboard/prediction/${year}`);
        if (!res.ok) {
          setError(`Backend error: ${res.status}`);
          return;
        }

        const data: LeaderboardRow[] = await res.json();
        setRows(data);
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [year]);

// csak rendezés pont szerint (DESC) – nincs összevonás
    const standings = useMemo(() => {
    return [...rows].sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));
    }, [rows]);

    const top3 = useMemo(() => standings.slice(0, 3), [standings]);

  return (
    <div className="f1-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-2)] tracking-widest">PREDICTION STANDINGS</p>
          <h2 className="text-xl font-semibold mt-1">{year}</h2>
        </div>
      </div>

      <div className="mt-5 h-px f1-divider" />

      {loading ? (
        <div className="mt-4 text-sm text-[var(--text-1)]">Loading…</div>
      ) : error ? (
        <div className="mt-4 text-sm text-red-400">{error}</div>
      ) : (
        <div className="mt-4 f1-glass p-0 overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: `${maxHeightPx}px` }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr
                  className="border-b"
                  style={{
                    background: "rgba(15, 22, 33, 0.85)",
                    borderColor: "var(--line)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <th className="text-left font-medium px-4 py-3 text-[var(--text-2)] w-20">
                    POS
                  </th>
                  <th className="text-left font-medium px-4 py-3 text-[var(--text-2)]">
                    NAME
                  </th>
                  <th className="text-right font-medium px-4 py-3 text-[var(--text-2)] w-24">
                    PTS
                  </th>
                </tr>
              </thead>

              <tbody>
                {standings.map((r, index) => (
                <tr
                    key={`${r.username}-${index}`}
                    className="border-b last:border-b-0"
                    style={{ borderColor: "var(--line)" }}
                >
                    <td className="px-4 py-3">
                    <span
                        className="inline-flex items-center justify-center rounded-md border px-2 py-1 min-w-[40px]"
                        style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        }}
                    >
                        {index + 1}
                    </span>
                    </td>

                    <td className="px-4 py-3 font-semibold">{r.username}</td>

                    <td className="px-4 py-3 text-right font-semibold">
                    {r.points}
                    </td>
                </tr>
                ))}
              </tbody>
            </table>

            {standings.length === 0 && (
            <div className="p-4 text-sm text-[var(--text-1)]">No data.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
