"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DRIVERS } from "@/public/drivers";
import { GP_ROUNDS } from "@/public/gpRounds";
import LapComparisonChartCard, { LapComparisonResponse } from "./LapComparisonCard";
import { api } from "@/lib/api/client";

type SessionCode = "FP1" | "FP2" | "FP3" | "Q" | "S" | "R";

type Props = {
  defaultSeason?: number;
  defaultRound?: number;
  defaultSessionCode?: SessionCode;
  defaultDriver1?: string;
  defaultDriver2?: string;
  className?: string;
};

export default function LapComparisonQueryCard({
  defaultSeason = 2025,
  defaultRound = 1,
  defaultSessionCode = "Q",
  defaultDriver1 = "VER",
  defaultDriver2 = "NOR",
  className = "",
}: Props) {
  const [season, setSeason] = useState<number>(defaultSeason);
  const [round, setRound] = useState<number>(defaultRound);
  const [sessionCode, setSessionCode] = useState<SessionCode>(defaultSessionCode);
  const [driver1, setDriver1] = useState<string>(defaultDriver1);
  const [driver2, setDriver2] = useState<string>(defaultDriver2);

  const [data, setData] = useState<LapComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const seasonOptions = useMemo(() => {
    const out: number[] = [];
    for (let y = 2026; y >= 1950; y--) out.push(y);
    return out;
  }, []);

  const gp = useMemo(() => GP_ROUNDS.find((g: any) => g.round === round), [round]);
  const grandPrix = gp?.label ?? ""; // <-- ez megy a backendnek

  const canLoad = useMemo(() => {
    return (
      season >= 1950 &&
      season <= 2026 &&
      !!grandPrix &&
      !!sessionCode &&
      !!driver1 &&
      !!driver2 &&
      driver1 !== driver2
    );
  }, [season, grandPrix, sessionCode, driver1, driver2]);

  async function loadComparison() {
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, response } = await api.GET("/api/lap-comparison", {
        params: {
          query: {
            season,
            grand_prix: grandPrix,
            session_code: sessionCode,
            driver1,
            driver2,
          },
        },
      });

      if (!response.ok) {
        throw new Error(`Lap comparison failed (${response.status})`);
      }

      // spec-ben a response schema üres {}, ezért guard kell
      const json = data as LapComparisonResponse;

      setData(json);
      toast.success("Lap comparison loaded!");
    } catch (e: any) {
      setData(null);
      setErrorMsg(e?.message ?? "Something went wrong.");
      toast.error("Failed to load lap comparison");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {/* Query panel */}
      <div className="f1-panel">
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">Lap comparison</h2>
              <p className="text-sm" style={{ color: "var(--text-1)" }}>
                {gp ? `${gp.round}. ${gp.label}` : `Round ${round}`} · {season} · {sessionCode}
              </p>
            </div>
            <span className="f1-badge">Compare</span>
          </div>

          <div className="my-4 h-px w-full f1-divider border-t" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Season">
              <Select value={String(season)} onChange={(v) => setSeason(Number(v))}>
                {seasonOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Round">
              <Select value={String(round)} onChange={(v) => setRound(Number(v))}>
                {GP_ROUNDS.map((g: any) => (
                  <option key={g.round} value={g.round}>
                    {g.round}. {g.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Session">
              <Select value={sessionCode} onChange={(v) => setSessionCode(v as SessionCode)}>
                {(["FP1", "FP2", "FP3", "Q", "S", "R"] as SessionCode[]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PickSelect label="Driver 1" value={driver1} onChange={setDriver1} disabledCodes={new Set([driver2])} />
            <PickSelect label="Driver 2" value={driver2} onChange={setDriver2} disabledCodes={new Set([driver1])} />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs" style={{ color: "var(--text-2)" }}>
              grand_prix: <span style={{ color: "var(--text-1)" }}>{grandPrix || "—"}</span>
            </p>

            <button
              type="button"
              onClick={loadComparison}
              disabled={!canLoad || loading}
              className="f1-btn h-[42px] px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: canLoad ? "rgba(182,255,46,0.45)" : undefined }}
            >
              {loading ? "Loading…" : "Compare"}
            </button>
          </div>

          {errorMsg ? <div className="mt-3 f1-error">{errorMsg}</div> : null}
        </div>
      </div>

      {/* Chart panel */}
      {data ? <LapComparisonChartCard data={data} /> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: "var(--text-1)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="f1-input f1-select w-full">
      {children}
    </select>
  );
}

function PickSelect({
  label,
  value,
  onChange,
  disabledCodes,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabledCodes: Set<string>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: "var(--text-1)" }}>
        {label}
      </span>

      <select value={value} onChange={(e) => onChange(e.target.value)} className="f1-input f1-select w-full">
        <option value="" disabled>
          Select driver…
        </option>
        {DRIVERS.map((code: any) => (
          <option key={code} value={code} disabled={disabledCodes.has(code)}>
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
