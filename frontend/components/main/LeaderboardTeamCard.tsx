"use client";

import { api } from "@/lib/api/client";
import { useEffect, useMemo, useState } from "react";

type LeaderboardRow = {
  team: string;
  points: number;
};

type Props = {
  year: number;
  maxHeightPx?: number;
};

export default function LeaderboardTeamCard({ year, maxHeightPx = 310 }: Props) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, response } = await api.GET("/api/leaderboard/team/{year}", {
          params: { path: { year } },
        });

        if (!response.ok || !data) {
          setError(`Backend error: ${response.status}`);
          return;
        }

        const rows = Array.isArray(data) ? (data as LeaderboardRow[]) : [];
        setRows(rows);
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [year]);

  // 1) csapatonként összevonás + 2) rendezés pont szerint (DESC)
  const teamStandings = useMemo(() => {
    const map = new Map<string, number>();

    for (const r of rows) {
      const key = r.team?.trim() || "Unknown";
      map.set(key, (map.get(key) ?? 0) + (Number(r.points) || 0));
    }

    const merged = Array.from(map.entries()).map(([team, points]) => ({
      team,
      points,
    }));

    merged.sort((a, b) => b.points - a.points); // legtöbb pont elöl
    return merged;
  }, [rows]);

  const top3 = useMemo(() => teamStandings.slice(0, 3), [teamStandings]);

  return (
    <div className="f1-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-2)] tracking-widest">TEAM STANDINGS</p>
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
                    TEAM
                  </th>
                  <th className="text-right font-medium px-4 py-3 text-[var(--text-2)] w-24">
                    PTS
                  </th>
                </tr>
              </thead>

              <tbody>
                {teamStandings.map((r, index) => (
                  <tr
                    key={r.team}
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

                    <td className="px-4 py-3 font-semibold">{r.team}</td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {r.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {teamStandings.length === 0 && (
              <div className="p-4 text-sm text-[var(--text-1)]">No data.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
