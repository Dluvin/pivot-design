"use client";

import { ELECTRIC_KEY, JOB_KEY } from "@/lib/design/job";
import { computePivotElectric } from "@/lib/design/pivot-electric";
import { DEFAULT_ELECTRIC, type Booster, type PivotElectricInput } from "@/lib/design/types";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";
import { DEFAULT_JOB, type DesignJob } from "@/lib/design/job";

export function PivotElectricForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [input, setInput] = usePersistentState<PivotElectricInput>(ELECTRIC_KEY, DEFAULT_ELECTRIC);
  const result = computePivotElectric(input);

  function patch(partial: Partial<PivotElectricInput>) {
    setInput({ ...input, ...partial });
  }
  function patchSpan(index: number, field: "quantity" | "lengthFt", value: number) {
    const spans = input.spans.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setInput({ ...input, spans });
  }

  return (
    <DesignChrome
      title="Center pivot amp draw & voltage drop"
      subtitle="Span cable, tower current, last-tower voltage, generator sizing."
      active="pivot-electric"
    >
      <JobLine {...job} />
      <YellowHint />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Pivot voltage"
          type="number"
          value={input.pivotVoltage}
          onChange={(v) => patch({ pivotVoltage: Number(v) })}
        />
        <Select
          label="Frequency"
          value={String(input.frequencyHz)}
          onChange={(v) => patch({ frequencyHz: Number(v) as 50 | 60 })}
          options={[
            { value: "60", label: "60 Hz" },
            { value: "50", label: "50 Hz" },
          ]}
        />
        <Select
          label="Booster pump"
          value={input.booster}
          onChange={(v) => patch({ booster: v as Booster })}
          options={[
            { value: "none", label: "No booster" },
            { value: "2hp", label: "2 HP" },
            { value: "5hp", label: "5 HP" },
            { value: "7.5hp", label: "7 1/2 HP" },
          ]}
        />
        <Select
          label="Machine speed"
          value={input.machineSpeed}
          onChange={(v) => patch({ machineSpeed: v as "standard" | "high" })}
          options={[
            { value: "standard", label: "Standard" },
            { value: "high", label: "High" },
          ]}
        />
        <Select
          label="Motor type"
          value={input.motorType}
          onChange={(v) => patch({ motorType: v as "helical" | "standard" })}
          options={[
            { value: "helical", label: "Helical" },
            { value: "standard", label: "Standard (worm)" },
          ]}
        />
        <Select
          label="Booster transformer"
          value={input.boosterTransformer ? "yes" : "no"}
          onChange={(v) => patch({ boosterTransformer: v === "yes" })}
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
        />
        <Input
          label="8 ga spans"
          type="number"
          value={input.eightGaugeSpans}
          onChange={(v) => patch({ eightGaugeSpans: Number(v) })}
        />
        <Input
          label="10 ga spans"
          type="number"
          value={input.tenGaugeSpans}
          onChange={(v) => patch({ tenGaugeSpans: Number(v) })}
        />
        <Input
          label="14 ga last spans"
          type="number"
          value={input.fourteenGaugeLastSpans}
          onChange={(v) => patch({ fourteenGaugeLastSpans: Number(v) })}
        />
      </div>

      <h2 className="font-display mt-8 text-xl">Span groups</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Group</th>
              <th className="px-3 py-2">Quantity</th>
              <th className="px-3 py-2">Length, ft</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {input.spans.map((span, i) => (
              <tr key={i}>
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-24 rounded-md border border-amber-300 bg-amber-50 px-2 py-1"
                    value={span.quantity}
                    onChange={(e) => patchSpan(i, "quantity", Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-28 rounded-md border border-amber-300 bg-amber-50 px-2 py-1"
                    value={span.lengthFt}
                    onChange={(e) => patchSpan(i, "lengthFt", Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="System current, A" value={fmt(result.systemCurrent)} />
        <Result label="Voltage drop, V" value={fmt(result.voltageDrop)} warn={result.warnings.some((w) => w.includes("voltage"))} />
        <Result label="Last tower voltage" value={fmt(result.lastTowerVoltage)} />
        <Result label="Length to LRDU, ft" value={fmt(result.lengthToLrdu, 0)} />
        <Result label="Power, kW" value={fmt(result.powerKw)} />
        <Result label="Generator HP req." value={fmt(result.generatorHp)} />
        <Result label="kW generator (min)" value={fmt(result.generatorKwMin, 1)} />
        <Result
          label="kW generator (rec.)"
          value={result.generatorKwRec == null ? "—" : fmt(result.generatorKwRec, 1)}
        />
      </div>
      <p className="mt-3 text-sm text-stone-600">
        Drive units {result.driveUnits} · std motors {result.stdMotors} · high motors {result.highMotors} · wire 8/10/12/14 ga:{" "}
        {result.wireCounts.g8}/{result.wireCounts.g10}/{result.wireCounts.g12}/{result.wireCounts.g14}
      </p>
      {result.warnings.length ? (
        <ul className="mt-3 list-disc pl-5 text-sm text-red-800">
          {result.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      <h2 className="font-display mt-8 text-xl">Span table</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Length</th>
              <th className="px-3 py-2">Wire</th>
              <th className="px-3 py-2">HP</th>
              <th className="px-3 py-2">RPM</th>
              <th className="px-3 py-2">Amps</th>
              <th className="px-3 py-2">Volts</th>
              <th className="px-3 py-2">Drop</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {result.spans.map((row) => (
              <tr key={row.number} className={row.ampacityWarning ? "bg-red-50" : ""}>
                <td className="px-3 py-1.5">{row.number}</td>
                <td className="px-3 py-1.5">{row.lengthFt}</td>
                <td className="px-3 py-1.5">{row.wireGauge}</td>
                <td className="px-3 py-1.5">{typeof row.motorHp === "number" ? fmt(row.motorHp, 1) : row.motorHp}</td>
                <td className="px-3 py-1.5">{row.rpm || "—"}</td>
                <td className="px-3 py-1.5">{fmt(row.current)}</td>
                <td className="px-3 py-1.5">{fmt(row.voltage)}</td>
                <td className="px-3 py-1.5">{fmt(row.voltageDrop)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DesignChrome>
  );
}
