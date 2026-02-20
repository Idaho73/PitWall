"use client";

type Props = {
  year: number;
  years: number[];
  onChange: (year: number) => void;
};

export default function SeasonSelector({ year, years, onChange }: Props) {
  return (
    <div className="f1-glass p-2 inline-flex gap-2 rounded-[14px]">
      {years.map((y) => {
        const active = y === year;

        return (
          <button
            key={y}
            onClick={() => onChange(y)}
            className={`px-4 py-2 text-sm rounded-xl border transition ${
              active
                ? "f1-glow"
                : ""
            }`}
            style={{
              borderColor: active ? "rgba(182,255,46,0.45)" : "rgba(255,255,255,0.12)",
              background: active ? "rgba(182,255,46,0.10)" : "rgba(255,255,255,0.06)",
            }}
          >
            {y}
          </button>
        );
      })}
    </div>
  );
}
