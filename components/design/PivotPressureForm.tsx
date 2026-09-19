"use client";

import { DEFAULT_JOB, JOB_KEY, PRESSURE_KEY, type DesignJob } from "@/lib/design/job";
import { PIPE_DIAMETERS } from "@/lib/design/lookups";
import { computePivotPressure, type PivotPressureInput } from "@/lib/design/pivot-pressure";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";

const DEFAULT_PRESSURE: PivotPressureInput = {
  pivotGpm: 800,
  cFactor: 150,
  endGunRadiusFt: 100,
  booster: "2hp",
  spans: [
    { quantity: 0, lengthFt: 160, diameterId: "10" },
    { quantity: 0, lengthFt: 180, diameterId: "8-5/8" },
    { quantity: 0, lengthFt: 180, diameterId: "6-5/8" },
    { quantity: 0, lengthFt: 185, diameterId: "6-5/8" },
    { quantity: 6, lengthFt: 205, diameterId: "6-5/8" },
    { quantity: 0, lengthFt: 0, diameterId: "6-5/8" },
    { quantity: 0, lengthFt: 0, diameterId: "6-5/8" },
  ],
  overhangFt: 54,
  overhangDiameterId: "6-5/8",
  elevationFt: 10,
  regulatorPsi: 10,
  unregulatedElevationFt: 10,
  unregulatedEndPsi: 10,
};

export function PivotPressureForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [input, setInput] = usePersistentState<PivotPressureInput>(PRESSURE_KEY, DEFAULT_PRESSURE);
  const result = computePivotPressure(input);

  function patch(partial: Partial<PivotPressureInput>) {
    setInput({ ...input, ...partial });
  }

  return (
    <DesignChrome title="Center pivot pressure loss" subtitle="Span pipe friction, regulator pressure, end-gun flow." active="pivot-pressure">
      <JobLine {...job} />
      <YellowHint />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Pivot GPM" type="number" value={input.pivotGpm} onChange={(v) => patch({ pivotGpm: Number(v) })} />
        <Input label="C-factor" type="number" value={input.cFactor} onChange={(v) => patch({ cFactor: Number(v) })} />
        <Input label="End gun radius, ft" type="number" value={input.endGunRadiusFt} onChange={(v) => patch({ endGunRadiusFt: Number(v) })} />
        <Select
          label="Booster"
          value={input.booster}
          onChange={(v) => patch({ booster: v as PivotPressureInput["booster"] })}
          options={[
            { value: "none", label: "None" },
            { value: "2hp", label: "2 HP" },
            { value: "5hp", label: "5 HP" },
            { value: "7.5hp", label: "7 1/2 HP" },
          ]}
        />
        <Input label="Overhang, ft" type="number" value={input.overhangFt} onChange={(v) => patch({ overhangFt: Number(v) })} />
        <Select
          label="Overhang diameter"
          value={input.overhangDiameterId}
          onChange={(v) => patch({ overhangDiameterId: v })}
          options={PIPE_DIAMETERS.map((d) => ({ value: d.id, label: d.label }))}
        />
        <Input label="Reg. elevation, ft" type="number" value={input.elevationFt} onChange={(v) => patch({ elevationFt: Number(v) })} />
        <Input label="Regulator rating, psi" type="number" value={input.regulatorPsi} onChange={(v) => patch({ regulatorPsi: Number(v) })} />
        <Input
          label="Unregulated elevation, ft"
          type="number"
          value={input.unregulatedElevationFt}
          onChange={(v) => patch({ unregulatedElevationFt: Number(v) })}
        />
        <Input
          label="Unregulated end pressure, psi"
          type="number"
          value={input.unregulatedEndPsi}
          onChange={(v) => patch({ unregulatedEndPsi: Number(v) })}
        />
      </div>
      <h2 className="font-display mt-8 text-xl">Span pipe</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Length, ft</th>
              <th className="px-3 py-2">Diameter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {input.spans.map((span, i) => (
              <tr key={i}>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-20 rounded-md border border-amber-300 bg-amber-50 px-2 py-1"
                    value={span.quantity}
                    onChange={(e) => {
                      const spans = input.spans.map((s, idx) => (idx === i ? { ...s, quantity: Number(e.target.value) } : s));
                      patch({ spans });
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-24 rounded-md border border-amber-300 bg-amber-50 px-2 py-1"
                    value={span.lengthFt}
                    onChange={(e) => {
                      const spans = input.spans.map((s, idx) => (idx === i ? { ...s, lengthFt: Number(e.target.value) } : s));
                      patch({ spans });
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1"
                    value={span.diameterId}
                    onChange={(e) => {
                      const spans = input.spans.map((s, idx) => (idx === i ? { ...s, diameterId: e.target.value } : s));
                      patch({ spans });
                    }}
                  >
                    {PIPE_DIAMETERS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Total length, ft" value={fmt(result.totalLength, 0)} />
        <Result label="Friction loss, psi" value={fmt(result.calculatedPsi)} />
        <Result label="Reg. pivot pressure, psi" value={fmt(result.pivotPressureReg)} />
        <Result label="Unreg. pivot pressure, psi" value={fmt(result.unregulatedPivot)} />
        <Result label="End gun GPM" value={fmt(result.endGunGpm, 1)} />
        <Result label="Max booster GPM" value={result.maxBp ? fmt(result.maxBp, 0) : "—"} />
        <Result
          label="EG underwater"
          value={result.underwater ? `${fmt(result.underwater * 100, 1)}%` : "—"}
          warn={result.underwater > 0}
        />
        <Result label="Flow deviation" value={`${fmt(result.flowDeviation * 100, 0)}%`} />
      </div>
      {result.underwater > 0 ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          Flow too high at end gun. Try longer spans, more spans, or lower GPM. Max booster {fmt(result.maxBp, 0)} GPM
          (1.52: 130 / 175 / 230 for 2 / 5 / 7½ HP).
        </p>
      ) : null}
    </DesignChrome>
  );
}
