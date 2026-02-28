"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type PredictionRow = {
  id: number;
  username: string;
  round: number;
  identifier: string; // pl. "R"
  first: string;
  second: string;
  third: string;
};

type Props = {
  maxHeightPx?: number;
};

function DriverTag({ code }: { code: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
      }}
    >
      {code}
    </span>
  );
}

export default function NextRacePredictionsCard({ maxHeightPx = 310 }: Props) {
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<{ username: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      return;
    }

    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem("access_token");
          setUser(null);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/predictions/next-race");
      if (!res.ok) {
        setError(`Backend error: ${res.status}`);
        return;
      }

      const data = await res.json();
      const rows = Array.isArray(data) ? (data as PredictionRow[]) : [];
      setRows(rows);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) =>
      (a.username || "").localeCompare(b.username || "")
    );
  }, [rows]);

  const meta = useMemo(() => {
    if (sorted.length === 0) return null;
    const { round, identifier } = sorted[0];
    return { round, identifier };
  }, [sorted]);

  const locked = !user;

  return (
    <div className="relative">
      {/* CONTENT (blurred when locked, but still readable) */}
      <div
        className={`
          f1-panel p-6 transition
          ${locked ? "blur-[2px] brightness-75 saturate-50 pointer-events-none select-none" : ""}
        `}
      >
        <div>
          <p className="text-xs text-[var(--text-2)] tracking-widest">
            NEXT RACE
          </p>
          <h2 className="text-xl font-semibold mt-1">
            Predictions
            {meta && (
              <span className="text-sm font-medium text-[var(--text-2)] ml-2">
                • Round {meta.round} • {meta.identifier}
              </span>
            )}
          </h2>
        </div>

        <div className="mt-5 h-px f1-divider" />

        {loading ? (
          <div className="mt-4 text-sm text-[var(--text-1)]">Loading…</div>
        ) : error ? (
          <div className="mt-4 text-sm text-red-400">{error}</div>
        ) : (
          <div className="mt-4 f1-glass p-0 overflow-hidden">
            <div
              className="overflow-auto"
              style={{ maxHeight: `${maxHeightPx}px` }}
            >
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
                    <th className="text-left font-medium px-4 py-3 text-[var(--text-2)]">
                      USER
                    </th>
                    <th className="text-center font-medium px-4 py-3 text-[var(--text-2)]">
                      P1
                    </th>
                    <th className="text-center font-medium px-4 py-3 text-[var(--text-2)]">
                      P2
                    </th>
                    <th className="text-center font-medium px-4 py-3 text-[var(--text-2)]">
                      P3
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <td className="px-4 py-3 font-semibold">{r.username}</td>

                      <td className="px-4 py-3 text-center">
                        <DriverTag code={r.first} />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <DriverTag code={r.second} />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <DriverTag code={r.third} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sorted.length === 0 && (
                <div className="p-4 text-sm text-[var(--text-1)]">
                  No predictions yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LOCK OVERLAY (transparent enough so text is still visible) */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          
          {/* enyhe blur + dim layer */}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[5px] rounded-[var(--radius)]" />

          {/* content */}
          <div className="relative z-10 max-w-md">
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-0)" }}
            >
              Bejelentkezés szükséges
            </h3>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-1)" }}
            >
              A next race predikciók megtekintéséhez jelentkezz be.
            </p>

            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="mt-5 inline-block f1-btn px-5 py-2 font-medium"
              style={{
                borderColor: "rgba(182,255,46,0.45)",
                background: "rgba(182,255,46,0.12)",
              }}
            >
              Login
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
