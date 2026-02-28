"use client";

import { api } from "@/lib/api/client";
import { useEffect, useMemo, useState } from "react";

type LeaderboardRow = {
  driver: string;
  team: string;
  points: number;
  position: number;
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
        const { data, response } = await api.GET("/api/leaderboard/{year}", {
          params: {
            path: { year },
          },
        });

        if (!response.ok || !data) {
          setError(`Backend error: ${response.status}`);
          return;
        }

        // a backend már position szerint adja, de biztos ami biztos
        const sorted = [...data].sort((a, b) => a.position - b.position);
        setRows(sorted);
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [year]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <div className="f1-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-2)] tracking-widest">LEADERBOARD</p>
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
          {/* scroll container */}
          <div
            className="overflow-auto"
            style={{ maxHeight: `${maxHeightPx}px` }}
          >
            <table className="w-full text-sm">
              {/* sticky header */}
              <thead className="sticky top-0 z-10">
                <tr
                  className="border-b"
                  style={{
                    background: "rgba(15, 22, 33, 0.85)",
                    borderColor: "var(--line)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <th className="text-left font-medium px-4 py-3 text-[var(--text-2)] w-16">
                    POS
                  </th>
                  <th className="text-left font-medium px-4 py-3 text-[var(--text-2)]">
                    DRIVER
                  </th>
                  <th className="text-left font-medium px-4 py-3 text-[var(--text-2)]">
                    TEAM
                  </th>
                  <th className="text-right font-medium px-4 py-3 text-[var(--text-2)] w-24">
                    PTS
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr
                    key={`${r.position}-${r.driver}`}
                    className="border-b last:border-b-0"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center rounded-md border px-2 py-1"
                        style={{
                          borderColor: "rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        {r.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{r.driver}</td>
                    <td className="px-4 py-3 text-[var(--text-1)]">{r.team}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {r.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <div className="p-4 text-sm text-[var(--text-1)]">No data.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
