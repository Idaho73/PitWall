"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useMemo } from "react";

type DriverData = {
  code: string;
  team: string;
  color: string;
  distance: number[];
  speed: number[];
};

export type LapComparisonResponse = {
  event: string;
  year: number;
  session: string;
  driver1: DriverData;
  driver2: DriverData;
};

type Props = {
  data: LapComparisonResponse;
  className?: string;
};

export default function LapComparisonCard({ data, className = "" }: Props) {
  const chartData = useMemo(() => {
    const n = Math.min(
      data.driver1.distance.length,
      data.driver1.speed.length,
      data.driver2.distance.length,
      data.driver2.speed.length
    );

    const out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = {
        distance: data.driver1.distance[i],
        speed1: data.driver1.speed[i],
        speed2: data.driver2.speed[i],
      };
    }
    return out;
  }, [data]);

  return (
    <div className={`f1-panel ${className}`}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">
              {data.event} {data.year}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-1)" }}>
              {data.session} Session
            </p>
          </div>

          <span className="f1-badge">Speed</span>
        </div>

        <div className="my-4 h-px w-full f1-divider border-t" />

        <div className="flex flex-wrap gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.driver1.color }} />
            <span>
              {data.driver1.code} ({data.driver1.team})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.driver2.color }} />
            <span>
              {data.driver2.code} ({data.driver2.team})
            </span>
          </div>
        </div>

        <div className="w-full h-[380px]">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="distance" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="speed1"
                stroke={data.driver1.color}
                dot={false}
                name={data.driver1.code}
              />
              <Line
                type="monotone"
                dataKey="speed2"
                stroke={data.driver2.color}
                dot={false}
                name={data.driver2.code}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
