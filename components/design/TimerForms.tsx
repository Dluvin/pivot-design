"use client";

import { DEFAULT_JOB, JOB_KEY, LINEAR_TIMER_KEY, PIVOT_TIMER_KEY, type DesignJob } from "@/lib/design/job";
import { TIRES } from "@/lib/design/lookups";
import { computeLinearTimer, computePivotTimer, type LinearTimerInput, type PivotTimerInput } from "@/lib/design/timers";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";

const DEFAULT_PIVOT: PivotTimerInput = {
  distanceToLrdu: 1105.5,
  overhangFt: 82,
  endGunThrowFt: 103,
  pivotGpm: 1543,
  degrees: 180,
  endGunOnPct: 1,
  tireId: 7,
  measuredFtPerMin: 15.76,
  gearboxValley: true,
  hertz60: true,
  rpmCode: 8,
};

const DEFAULT_LINEAR: LinearTimerInput = {
  linearLengthFt: 2640,
  endGunThrowFt: 0,
  linearGpm: 2500,
  runFt: 5280,
  tireId: 4,
  measuredFtPerMin: 10,
  gearboxValley: true,
  hertz60: true,
  rpmCode: 6,
};

const tireOpts = TIRES.map((t) => ({ value: String(t.id), label: t.label }));
const rpmOpts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n) => ({
  value: String(n),
  label: n === 12 ? "12 (other / 20 RPM)" : String(n),
}));

export function PivotTimerForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [input, setInput] = usePersistentState<PivotTimerInput>(PIVOT_TIMER_KEY, DEFAULT_PIVOT);
  const result = computePivotTimer(input);
  function patch(partial: Partial<PivotTimerInput>) {
    setInput({ ...input, ...partial });
  }
  return (
    <DesignChrome title="Pivot percent timer chart" subtitle="Hours and inches by percent timer setting." active="pivot-timer">
      <JobLine {...job} />
      <YellowHint />
      <TimerDrive input={input} patch={(p) => patch(p)} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Distance to LRDU, ft" type="number" value={input.distanceToLrdu} onChange={(v) => patch({ distanceToLrdu: Number(v) })} />
        <Input label="Overhang, ft" type="number" value={input.overhangFt} onChange={(v) => patch({ overhangFt: Number(v) })} />
        <Input label="End gun throw, ft" type="number" value={input.endGunThrowFt} onChange={(v) => patch({ endGunThrowFt: Number(v) })} />
        <Input label="Pivot GPM" type="number" value={input.pivotGpm} onChange={(v) => patch({ pivotGpm: Number(v) })} />
        <Input label="Degrees of rotation" type="number" value={input.degrees} onChange={(v) => patch({ degrees: Number(v) })} />
        <Input
          label="% end gun on (0–1)"
          type="number"
          step="0.01"
          value={input.endGunOnPct}
          onChange={(v) => patch({ endGunOnPct: Number(v) })}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Speed, ft/min" value={fmt(result.speed)} />
        <Result label="End gun GPM" value={fmt(result.endGunGpm, 1)} />
        <Result label="Irrigated acres" value={fmt(result.acresEg, 1)} />
        <Result label="GPM / acre" value={fmt(result.gpmAcre, 1)} />
        <Result label="Inches / day" value={fmt(result.inchesDay)} />
        <Result label={result.partRev ? "Hours / part rev @ 100%" : "Hours / revolution @ 100%"} value={fmt(result.hours100, 1)} />
      </div>
      <TimerTable
        hours100={result.hours100}
        inches100={result.inches100}
        rows={result.rows}
        hoursLabel={result.partRev ? "Hours / part rev" : "Hours / rev"}
      />
      <Disclaimer />
    </DesignChrome>
  );
}

export function LinearTimerForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [input, setInput] = usePersistentState<LinearTimerInput>(LINEAR_TIMER_KEY, DEFAULT_LINEAR);
  const result = computeLinearTimer(input);
  function patch(partial: Partial<LinearTimerInput>) {
    setInput({ ...input, ...partial });
  }
  return (
    <DesignChrome title="Linear percent timer chart" subtitle="Hours and inches per pass." active="linear-timer">
      <JobLine {...job} />
      <YellowHint />
      <TimerDrive input={input} patch={(p) => patch(p)} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Linear length, ft" type="number" value={input.linearLengthFt} onChange={(v) => patch({ linearLengthFt: Number(v) })} />
        <Input label="End gun throw, ft" type="number" value={input.endGunThrowFt} onChange={(v) => patch({ endGunThrowFt: Number(v) })} />
        <Input label="Linear GPM" type="number" value={input.linearGpm} onChange={(v) => patch({ linearGpm: Number(v) })} />
        <Input label="Length of run, ft" type="number" value={input.runFt} onChange={(v) => patch({ runFt: Number(v) })} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Speed, ft/min" value={fmt(result.speed)} />
        <Result label="Irrigated acres" value={fmt(result.acres, 1)} />
        <Result label="GPM / acre" value={fmt(result.gpmAcre, 1)} />
        <Result label="Inches / day" value={fmt(result.inchesDay)} />
        <Result label="Hours / pass @ 100%" value={fmt(result.hours100, 1)} />
      </div>
      <TimerTable hours100={result.hours100} inches100={result.inches100} rows={result.rows} hoursLabel="Hours / pass" />
      <Disclaimer />
    </DesignChrome>
  );
}

function TimerDrive({
  input,
  patch,
}: {
  input: { tireId: number; measuredFtPerMin: number; gearboxValley: boolean; hertz60: boolean; rpmCode: number };
  patch: (partial: Partial<typeof input>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Select label="Tire" value={String(input.tireId)} onChange={(v) => patch({ tireId: Number(v) })} options={tireOpts} />
      <Select
        label="Gearbox"
        value={input.gearboxValley ? "valley" : "other"}
        onChange={(v) => patch({ gearboxValley: v === "valley" })}
        options={[
          { value: "valley", label: "Valley 52:1" },
          { value: "other", label: "50:1" },
        ]}
      />
      <Select
        label="Hertz"
        value={input.hertz60 ? "60" : "50"}
        onChange={(v) => patch({ hertz60: v === "60" })}
        options={[
          { value: "60", label: "60 Hz" },
          { value: "50", label: "50 Hz" },
        ]}
      />
      <Select label="RPM code" value={String(input.rpmCode)} onChange={(v) => patch({ rpmCode: Number(v) })} options={rpmOpts} />
      {input.tireId === 7 ? (
        <Input
          label="Measured ft/min"
          type="number"
          step="0.01"
          value={input.measuredFtPerMin}
          onChange={(v) => patch({ measuredFtPerMin: Number(v) })}
        />
      ) : (
        <div />
      )}
    </div>
  );
}

function TimerTable({
  hours100,
  inches100,
  rows,
  hoursLabel,
}: {
  hours100: number;
  inches100: number;
  rows: { timer: number; hours: number; inches: number }[];
  hoursLabel: string;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-3 py-2">% timer</th>
            <th className="px-3 py-2">{hoursLabel}</th>
            <th className="px-3 py-2">Inches</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          <tr>
            <td className="px-3 py-1.5 font-medium">100</td>
            <td className="px-3 py-1.5">{fmt(hours100, 1)}</td>
            <td className="px-3 py-1.5">{fmt(inches100)}</td>
          </tr>
          {rows.map((row) => (
            <tr key={row.inches}>
              <td className="px-3 py-1.5">{fmt(row.timer, 1)}</td>
              <td className="px-3 py-1.5">{fmt(row.hours, 1)}</td>
              <td className="px-3 py-1.5">{fmt(row.inches)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="mt-6 text-xs text-stone-500">
      These charts depend on end-gun range, PSI, and GPM you enter. They are a design aid, not a recommendation of timer
      setting or application rate.
    </p>
  );
}
