"use client";

import { useMemo, useState } from "react";
import { DRIVERS } from "@/public/drivers";
import { GP_ROUNDS } from "@/public/gpRounds";
import { toast } from "sonner";

type Identifier = "R" | "S";

type Props = {
  defaultYear?: number;
  defaultRound?: number;
  defaultIdentifier?: Identifier;
  className?: string;
};

export default function SubmitPredictionCard({
  defaultYear = 2026,
  defaultRound = 1,
  defaultIdentifier = "R",
  className = "",
}: Props) {
  const [year, setYear] = useState<number>(defaultYear);
  const [round, setRound] = useState<number>(defaultRound);
  const [identifier, setIdentifier] = useState<Identifier>(defaultIdentifier);

  const [p1, setP1] = useState<string>("");
  const [p2, setP2] = useState<string>("");
  const [p3, setP3] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const yearOptions = useMemo(() => {
    const out: number[] = [];
    for (let y = 2026; y >= 1950; y--) out.push(y);
    return out;
  }, []);

  const selected = useMemo(() => [p1, p2, p3].filter(Boolean), [p1, p2, p3]);

  const canSubmit = useMemo(() => {
    const picks = [p1, p2, p3].filter(Boolean);
    return (
      year >= 1950 &&
      year <= 2026 &&
      round >= 1 &&
      identifier.length > 0 &&
      picks.length === 3 &&
      new Set(picks).size === 3
    );
  }, [year, round, identifier, p1, p2, p3]);

  const currentGpLabel = useMemo(() => {
    const gp = GP_ROUNDS.find((g: any) => g.round === round);
    return gp ? `${gp.round}. ${gp.label}` : `Round ${round}`;
  }, [round]);

  async function submit() {
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Nem vagy bejelentkezve.");
      }

      const body = {
        year,
        round,
        identifier,
        picks: [p1, p2, p3],
      };

      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          localStorage.removeItem("access_token");
          window.dispatchEvent(new Event("auth-changed"));
        }

        throw new Error(
          data?.detail ?? data?.message ?? `Submit failed: ${res.status}`
        );
      }

      setP1("");
      setP2("");
      setP3("");
      toast.success("Prediction submitted successfully!");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Something went wrong.");
      toast.error("Failed to submit prediction");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`f1-panel ${className}`}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">Submit prediction</h2>
            <p className="text-sm" style={{ color: "var(--text-1)" }}>
              {currentGpLabel} · {year} · {identifier === "R" ? "Race" : "Sprint"}
            </p>
          </div>

          <span className="f1-badge">Top 3</span>
        </div>

        <div className="my-4 h-px w-full f1-divider border-t" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Year">
            <Select value={String(year)} onChange={(v) => setYear(Number(v))}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Round">
            <Select value={String(round)} onChange={(v) => setRound(Number(v))}>
              {GP_ROUNDS.map((gp: any) => (
                <option key={gp.round} value={gp.round}>
                  {gp.round}. {gp.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Type">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIdentifier("R")}
                className={`f1-btn h-[42px] w-full px-3 text-sm ${identifier === "R" ? "f1-glow" : ""}`}
                style={
                  identifier === "R"
                    ? { borderColor: "rgba(182,255,46,0.45)", background: "rgba(182,255,46,0.10)" }
                    : undefined
                }
              >
                Race
              </button>

              <button
                type="button"
                onClick={() => setIdentifier("S")}
                className={`f1-btn h-[42px] w-full px-3 text-sm ${identifier === "S" ? "f1-glow" : ""}`}
                style={
                  identifier === "S"
                    ? { borderColor: "rgba(182,255,46,0.45)", background: "rgba(182,255,46,0.10)" }
                    : undefined
                }
              >
                Sprint
              </button>
            </div>
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PickSelect label="P1" value={p1} onChange={setP1} disabledCodes={new Set([p2, p3].filter(Boolean))} />
          <PickSelect label="P2" value={p2} onChange={setP2} disabledCodes={new Set([p1, p3].filter(Boolean))} />
          <PickSelect label="P3" value={p3} onChange={setP3} disabledCodes={new Set([p1, p2].filter(Boolean))} />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs" style={{ color: "var(--text-2)" }}>
            {selected.length === 0 ? "Pick 3 unique drivers." : `Selected: ${selected.join(", ")}`}
          </p>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="f1-btn h-[42px] px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: canSubmit ? "rgba(182,255,46,0.45)" : undefined }}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>

        {successMsg ? (
          <div
            className="mt-3 rounded-xl border px-3 py-2 text-sm"
            style={{
              borderColor: "rgba(182,255,46,0.35)",
              background: "rgba(182,255,46,0.10)",
              color: "var(--text-0)",
            }}
          >
            {successMsg}
          </div>
        ) : null}

        {errorMsg ? <div className="mt-3 f1-error">{errorMsg}</div> : null}
      </div>
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
