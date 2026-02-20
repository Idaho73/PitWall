"use client";

import { useMemo, useState } from "react";
import SeasonSelector from "@/components/main/SeasonSelector";
import LeaderboardCard from "@/components/main/LeaderboardTeamCard"; // team standings (a mostani)
import DriverLeaderboardCard from "@/components/main/LeaderboardCard"; // a driveres kártyád

export default function Home() {
  const years = useMemo(() => [2025, 2024, 2023, 2022], []);
  const [year, setYear] = useState<number>(years[0]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-[var(--text-2)] tracking-widest">SEASON</p>
          <h1 className="text-2xl font-semibold mt-1">Leaderboards</h1>
          <p className="text-sm text-[var(--text-1)] mt-1">
            Select a season to update both standings.
          </p>
        </div>

        <SeasonSelector year={year} years={years} onChange={setYear} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DriverLeaderboardCard year={year} />
        <LeaderboardCard year={year} />
      </div>
    </div>
  );
}
