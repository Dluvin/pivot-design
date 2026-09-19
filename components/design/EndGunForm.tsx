"use client";

import Link from "next/link";
import { DesignChrome, Input, JobLine, Result, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";
import { DEFAULT_END_GUN, computeEndGun, type EndGunInput, type EndGunOption } from "@/lib/design/end-gun";
import { DEFAULT_PRESSURE, DEFAULT_PIVOT_TIMER } from "@/lib/design/defaults";
import { DEFAULT_JOB, END_GUN_KEY, JOB_KEY, PRESSURE_KEY, PIVOT_TIMER_KEY, type DesignJob } from "@/lib/design/job";
import { computePivotPressure, type PivotPressureInput } from "@/lib/design/pivot-pressure";
import type { PivotTimerInput } from "@/lib/design/timers";

function OptionCard({ opt }: { opt: EndGunOption }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h2 className="font-display text-lg">{opt.label}</h2>
      {opt.maxGpm ? <p className="text-xs text-stone-500">Max booster GPM {opt.maxGpm}</p> : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Result label="Pressure boost, psi" value={fmt(opt.boostPsi)} />
        <Result label="Nozzle pressure, psi" value={fmt(opt.nozzlePsi)} warn={opt.nozzlePsi < 40 || opt.negativePsi} />
        <Result label="Nozzle size" value={fmt(opt.nozzleSize, 2)} />
        <Result label="Req. EG GPM" value={fmt(opt.reqGpm, 1)} />
        <Result label="Actual EG GPM" value={fmt(opt.actualGpm, 1)} />
        <Result label="Radius, ft" value={fmt(opt.radiusFt, 1)} />
        <Result label="Irrigated acres" value={fmt(opt.acres, 2)} />
      </div>
      {opt.negativePsi ? <p className="mt-2 text-sm font-semibold text-red-700">Negative end gun pressure!</p> : null}
      {opt.waterWarn ? (
        <p className="mt-2 text-sm font-semibold text-red-700">
          {opt.waterWarn} {opt.waterPct != null ? `${fmt(opt.waterPct * 100, 1)}%` : ""}
        </p>
      ) : null}
    </div>
  );
}

export function EndGunForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [pressure] = usePersistentState<PivotPressureInput>(PRESSURE_KEY, DEFAULT_PRESSURE);
  const [timer] = usePersistentState<PivotTimerInput>(PIVOT_TIMER_KEY, DEFAULT_PIVOT_TIMER);
  const [override, setOverride] = usePersistentState<EndGunInput>(END_GUN_KEY, DEFAULT_END_GUN);
  const press = computePivotPressure(pressure);
  const linked: EndGunInput = {
    pivotGpm: job.pivotGpm || pressure.pivotGpm,
    distanceToLrdu: timer.distanceToLrdu,
    overhangFt: pressure.overhangFt,
    endPressurePsi: pressure.regulatorPsi + press.regulatorAdder,
    degrees: timer.degrees,
    endGunOnPct: timer.endGunOnPct,
  };
  const [useLinked, setUseLinked] = usePersistentState<boolean>("ag-design-end-gun-linked", true);
  const input = useLinked ? linked : override;
  const result = computeEndGun(input);

  function patch(partial: Partial<EndGunInput>) {
    setUseLinked(false);
    setOverride({ ...input, ...partial });
  }

  return (
    <DesignChrome
      title="End gun radius"
      subtitle="Nelson SR100 performance with booster at the last drive unit. Formulas from Pivot Design 1.52."
      active="end-gun"
    >
      <JobLine {...job} />
      <YellowHint />
      <p className="mt-2 text-sm text-stone-600">
        Linked values come from{" "}
        <Link href="/" className="font-semibold text-emerald-800 hover:underline">
          Main menu GPM
        </Link>
        ,{" "}
        <Link href="/pivot-timer" className="font-semibold text-emerald-800 hover:underline">
          Pivot timer
        </Link>
        , and{" "}
        <Link href="/pivot-pressure" className="font-semibold text-emerald-800 hover:underline">
          Pivot pressure
        </Link>
        .
      </p>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={useLinked} onChange={(e) => setUseLinked(e.target.checked)} />
        Use linked job / timer / pressure values
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Pivot GPM" type="number" value={input.pivotGpm} onChange={(v) => patch({ pivotGpm: Number(v) })} />
        <Input
          label="Distance to LRDU, ft"
          type="number"
          value={input.distanceToLrdu}
          onChange={(v) => patch({ distanceToLrdu: Number(v) })}
        />
        <Input label="Overhang, ft" type="number" value={input.overhangFt} onChange={(v) => patch({ overhangFt: Number(v) })} />
        <Input
          label="End pressure, psi"
          type="number"
          value={input.endPressurePsi}
          onChange={(v) => patch({ endPressurePsi: Number(v) })}
        />
        <Input label="Degrees of rotation" type="number" value={input.degrees} onChange={(v) => patch({ degrees: Number(v) })} />
        <Input
          label="% end gun on (0–1)"
          type="number"
          step="0.01"
          value={input.endGunOnPct}
          onChange={(v) => patch({ endGunOnPct: Number(v) })}
        />
      </div>
      {result.warnings.length ? (
        <ul className="mt-4 list-disc pl-5 text-sm font-semibold text-red-700">
          {result.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <OptionCard opt={result.hp2} />
        <OptionCard opt={result.hp5} />
        <OptionCard opt={result.hp75} />
        <OptionCard opt={result.none} />
      </div>
    </DesignChrome>
  );
}
