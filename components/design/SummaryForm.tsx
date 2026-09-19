"use client";

import Link from "next/link";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";
import {
  DEFAULT_MAINLINE_PSI,
  DEFAULT_PRESSURE,
  DEFAULT_PIVOT_TIMER,
} from "@/lib/design/defaults";
import { DEFAULT_ELECTRIC } from "@/lib/design/types";
import { DEFAULT_JOB, ELECTRIC_KEY, JOB_KEY, MAINLINE_PSI_KEY, PRESSURE_KEY, PIVOT_TIMER_KEY, SUMMARY_KEY, type DesignJob } from "@/lib/design/job";
import type { MainlinePressureInput } from "@/lib/design/mainline-pressure";
import type { PivotPressureInput } from "@/lib/design/pivot-pressure";
import { computeSummary, DEFAULT_SUMMARY, type EnergySource, type SummaryInput } from "@/lib/design/summary";
import type { PivotTimerInput } from "@/lib/design/timers";
import type { PivotElectricInput } from "@/lib/design/types";

export function SummaryForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [electric] = usePersistentState<PivotElectricInput>(ELECTRIC_KEY, DEFAULT_ELECTRIC);
  const [pressure] = usePersistentState<PivotPressureInput>(PRESSURE_KEY, DEFAULT_PRESSURE);
  const [mainlinePsi] = usePersistentState<MainlinePressureInput>(MAINLINE_PSI_KEY, DEFAULT_MAINLINE_PSI);
  const [pivotTimer] = usePersistentState<PivotTimerInput>(PIVOT_TIMER_KEY, DEFAULT_PIVOT_TIMER);
  const [summary, setSummary] = usePersistentState<SummaryInput>(SUMMARY_KEY, DEFAULT_SUMMARY);
  const result = computeSummary({
    summary,
    electric,
    pressure,
    mainlinePsi,
    pivotTimer,
    pivotGpm: job.pivotGpm || pressure.pivotGpm,
  });

  function patch(partial: Partial<SummaryInput>) {
    setSummary({ ...summary, ...partial });
  }

  return (
    <DesignChrome
      title="Center pivot design summary"
      subtitle="Acres, TDH, generator and pump HP, and annual energy cost from Pivot Design 1.52."
      active="summary"
    >
      <JobLine {...job} />
      <YellowHint />
      <p className="mt-2 text-sm text-stone-600">
        Pulls length and friction from{" "}
        <Link href="/pivot-pressure" className="font-semibold text-emerald-800 hover:underline">
          Pivot pressure
        </Link>
        , current from{" "}
        <Link href="/pivot-electric" className="font-semibold text-emerald-800 hover:underline">
          Pivot electric
        </Link>
        , and rotation from{" "}
        <Link href="/pivot-timer" className="font-semibold text-emerald-800 hover:underline">
          Pivot timer
        </Link>
        .
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Pivot length, ft" value={fmt(result.length, 1)} />
        <Result label="End gun radius, ft" value={fmt(result.eg, 1)} />
        <Result label="Flow, GPM" value={fmt(result.gpm, 0)} />
        <Result label="Degrees" value={fmt(result.degrees, 0)} />
        <Result label="Irrigated acres" value={fmt(result.acres, 2)} />
        <Result label="GPM / acre" value={fmt(result.gpmAcre, 2)} />
        <Result label="Inches / day" value={fmt(result.inchesDay, 3)} />
        <Result label="System current, A" value={fmt(result.systemCurrent)} warn={result.systemCurrent > 45} />
        <Result label="Voltage drop, V" value={fmt(result.voltageDrop)} />
        <Result label="Last tower, V" value={fmt(result.lastTowerVoltage)} warn={result.lastTowerVoltage < 440} />
      </div>
      <h2 className="font-display mt-8 text-xl">Pump TDH</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Elevation change, ft"
          type="number"
          value={summary.elevationFt}
          onChange={(v) => patch({ elevationFt: Number(v) })}
        />
        <Input label="Riser height, ft" type="number" value={summary.riserFt} onChange={(v) => patch({ riserFt: Number(v) })} />
        <Input
          label="Hookup to pivot, psi"
          type="number"
          value={summary.hookupPivotPsi}
          onChange={(v) => patch({ hookupPivotPsi: Number(v) })}
        />
        <Input
          label="Pivot-point elevation, psi"
          type="number"
          value={summary.pivotPointElevPsi}
          onChange={(v) => patch({ pivotPointElevPsi: Number(v) })}
        />
        <Input
          label="Hookup to mainline, psi"
          type="number"
          value={summary.hookupMainPsi}
          onChange={(v) => patch({ hookupMainPsi: Number(v) })}
        />
        <Input
          label="Suction lift, ft"
          type="number"
          value={summary.suctionLiftFt}
          onChange={(v) => patch({ suctionLiftFt: Number(v) })}
        />
        <Input label="Pump lift, ft" type="number" value={summary.pumpLiftFt} onChange={(v) => patch({ pumpLiftFt: Number(v) })} />
        <Input
          label="Column friction, psi"
          type="number"
          value={summary.columnLossPsi}
          onChange={(v) => patch({ columnLossPsi: Number(v) })}
        />
        <Input
          label="Pump efficiency"
          type="number"
          step="0.01"
          value={summary.pumpEfficiency}
          onChange={(v) => patch({ pumpEfficiency: Number(v) })}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Span friction, psi" value={fmt(result.frictionPsi)} />
        <Result label="Mainline friction, psi" value={fmt(result.mainlinePsi)} />
        <Result label="Pressure at swivel, psi" value={fmt(result.swivelPsi)} />
        <Result label="Lower riser, psi" value={fmt(result.lowerRiserPsi)} />
        <Result label="Pump discharge, psi" value={fmt(result.pumpDischargePsi)} />
        <Result label="Pump TDH, ft" value={fmt(result.tdhFt)} />
        <Result label="Pump TDH, psi" value={fmt(result.tdhPsi)} />
        <Result label="Brake HP" value={fmt(result.brakeHp)} />
      </div>
      <h2 className="font-display mt-8 text-xl">Energy cost</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Inches per year"
          type="number"
          value={summary.inchesPerYear}
          onChange={(v) => patch({ inchesPerYear: Number(v) })}
        />
        <Input
          label="Application efficiency"
          type="number"
          step="0.01"
          value={summary.efficiency}
          onChange={(v) => patch({ efficiency: Number(v) })}
        />
        <Input
          label="Avg. application, in"
          type="number"
          step="0.1"
          value={summary.averageAppInches}
          onChange={(v) => patch({ averageAppInches: Number(v) })}
        />
        <Select
          label="Energy source"
          value={summary.energySource}
          onChange={(v) => patch({ energySource: v as EnergySource })}
          options={[
            { value: "diesel", label: "Diesel" },
            { value: "electric", label: "Electric" },
            { value: "natural gas", label: "Natural gas" },
            { value: "propane", label: "Propane" },
          ]}
        />
        <Input label="$ / gal diesel" type="number" step="0.01" value={summary.dieselGal} onChange={(v) => patch({ dieselGal: Number(v) })} />
        <Input label="$ / kWh" type="number" step="0.001" value={summary.electricKwh} onChange={(v) => patch({ electricKwh: Number(v) })} />
        <Input label="$ / MCF natural gas" type="number" step="0.01" value={summary.ngMcf} onChange={(v) => patch({ ngMcf: Number(v) })} />
        <Input
          label="$ / gal propane"
          type="number"
          step="0.01"
          value={summary.propaneGal}
          onChange={(v) => patch({ propaneGal: Number(v) })}
        />
        <Input
          label="Demand / motor maint. $"
          type="number"
          value={summary.demandOrMaint}
          onChange={(v) => patch({ demandOrMaint: Number(v) })}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Hours / year" value={fmt(result.hoursYear, 0)} />
        <Result label="% timer for avg. app." value={fmt(result.timerFrac * 100, 1)} />
        <Result label="Generator HP @ 100%" value={fmt(result.generatorHp)} />
        <Result label="App. generator HP" value={fmt(result.genHpAtApp)} />
        <Result label="Total HP" value={fmt(result.totalHp)} />
        <Result label="$ / hp-hr" value={fmt(result.costPerHpHr, 4)} />
        <Result label="Annual operating cost" value={`$${fmt(result.annualCost, 0)}`} />
      </div>
    </DesignChrome>
  );
}
