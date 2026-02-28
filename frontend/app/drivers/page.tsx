"use client";

import { useEffect, useMemo, useState } from "react";
import DriverFlipCard, { type DriverApiRow } from "@/components/common/DriverFlipCard";

type SortMode = "name" | "titles" | "points";

export default function DriversPage() {
  const [rows, setRows] = useState<DriverApiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("titles");

  async function loadDrivers() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/drivers?season=2025", { method: "GET", cache: "no-store" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Drivers fetch failed (${res.status})`);
      }
      const json = (await res.json()) as DriverApiRow[];
      setRows(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setRows([]);
      setErrorMsg(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = rows.filter((d) => {
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);

      if (sort === "points") {
        const pa = a.stats?.points ?? 0;
        const pb = b.stats?.points ?? 0;
        if (pb !== pa) return pb - pa;
        return a.name.localeCompare(b.name);
      }

      // titles default
      const ta = a.stats?.championships ?? 0;
      const tb = b.stats?.championships ?? 0;
      if (tb !== ta) return tb - ta;
      // tie-breaker points
      const pa = a.stats?.points ?? 0;
      const pb = b.stats?.points ?? 0;
      if (pb !== pa) return pb - pa;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [rows, query, sort]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Drivers</h1>
          <p className="mt-1 text-sm text-white/60">
            All-time stats currently computed from season standings (titles + total points).
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search driver..."
              className="w-full sm:w-[280px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/30">
              ⌕
            </div>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          >
            <option value="titles" className="bg-black">Sort: Titles</option>
            <option value="points" className="bg-black">Sort: Points</option>
            <option value="name" className="bg-black">Sort: Name</option>
          </select>

          <button
            onClick={loadDrivers}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {errorMsg}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading drivers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No drivers found.
          </div>
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <DriverFlipCard key={d.code} driver={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}