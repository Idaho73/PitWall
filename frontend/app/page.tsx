"use client";
import LeaderboardCard from "@/components/main/LeaderboardCard";
import LeaderboardsSection from "@/components/main/LeaderboardsSection";
import LeaderboardTeamCard from "@/components/main/LeaderboardTeamCard";
import NextRacePredictionsCard from "@/components/main/NextRacePredictionsCard";
import NextRaceCard from "@/components/main/NextRaceCard";
import PredictionLeaderboardCard from "@/components/main/PredictionLeaderboardCard";
import SeasonStepper from "@/components/main/SeasonStepper";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
    const [year, setYear] = useState<number>(2025);
    const [predYear, setPredYear] = useState<number>(2025);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <NextRaceCard />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold mt-1">
          Leaderboards
        </h1>

        <div className="w-fit">
          <SeasonStepper
            year={year}
            onChange={setYear}
            minYear={1950}
            maxYear={2026}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-4">
        <div className="min-w-0">
          <LeaderboardCard year={year} />
        </div>

        <div className="min-w-0">
          <LeaderboardTeamCard year={year} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
      {/* Leaderboard column */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 items-start">
          <h1 className="text-2xl font-semibold tracking-tight">
            Prediction Leaderboards
          </h1>

          {/* Stepper – nem húzódik szét */}
          <div className="w-fit">
            <SeasonStepper
              year={predYear}
              onChange={setPredYear}
              minYear={1950}
              maxYear={2026}
            />
          </div>
        </div>

        {/* Card */}
        <PredictionLeaderboardCard year={predYear} />
      </div>

      {/* Üres / más widgetek helye */}
      <div>
      <NextRacePredictionsCard />
      </div>
      <div>
        <Image
          src="https://cdn.cms.mtv.hu/wp-content/uploads/sites/10/2026/01/XPB_1126223_HiRes-620x413.jpg"
          alt="Logo"
          width={400}
          height={200}
          priority
          className="rounded-lg opacity-90"
        />
      </div>
    </div>
     
    </div>
    
  );
}
