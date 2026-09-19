"use client";

import Link from "next/link";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";
import { DEFAULT_GPM_IAR, computeGpmIar } from "@/lib/design/gpm-iar";
import { DEFAULT_JOB, GPM_IAR_KEY, JOB_KEY, PRESSURE_KEY, type DesignJob } from "@/lib/design/job";
import { DEFAULT_PRESSURE } from "@/lib/design/defaults";
import { computePivotPressure, type PivotPressureInput } from "@/lib/design/pivot-pressure";

export function GpmIarForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [pressure] = usePersistentState<PivotPressureInput>(PRESSURE_KEY, DEFAULT_PRESSURE);
  const [extras, setExtras] = usePersistentState(GPM_IAR_KEY, DEFAULT_GPM_IAR);
  const press = computePivotPressure(pressure);
  const lengthToEg = press.totalLength;
  const input = {
    machineGpm: job.pivotGpm || pressure.pivotGpm,
    lengthToEgFt: lengthToEg,
    endGunRadiusFt: pressure.endGunRadiusFt,
    wettedDiameterFt: extras.wettedDiameterFt,
    spacingFt: extras.spacingFt,
    outletMode: extras.outletMode,
    outletDistanceFt: lengthToEg,
  };
  const result = computeGpmIar(input);

  return (
    <DesignChrome
      title="Sprinkler GPM & instantaneous application rate"
      subtitle="Valley 1.52 GPM & IAR sheet. Outlet mode uses distance from pivot to the last sprinkler."
      active="gpm-iar"
    >
      <JobLine {...job} />
      <YellowHint />
      <p className="mt-2 text-sm text-stone-600">
        Machine GPM from{" "}
        <Link href="/" className="font-semibold text-emerald-800 hover:underline">
          Main menu
        </Link>
        . Length and end-gun radius from{" "}
        <Link href="/pivot-pressure" className="font-semibold text-emerald-800 hover:underline">
          Pivot pressure
        </Link>
        .
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Result label="Machine GPM" value={fmt(input.machineGpm, 0)} />
        <Result label="Length to EG, ft" value={fmt(input.lengthToEgFt, 1)} />
        <Result label="End gun radius, ft" value={fmt(input.endGunRadiusFt, 1)} />
        <Input
          label="Wetted diameter, ft"
          type="number"
          value={extras.wettedDiameterFt}
          onChange={(v) => setExtras({ ...extras, wettedDiameterFt: Number(v) })}
        />
        <Input
          label="Distance between sprinklers, ft"
          type="number"
          value={extras.spacingFt}
          onChange={(v) => setExtras({ ...extras, spacingFt: Number(v) })}
        />
        <Select
          label="Sprinkler layout"
          value={extras.outletMode ? "outlet" : "linear"}
          onChange={(v) => setExtras({ ...extras, outletMode: v === "outlet" })}
          options={[
            { value: "outlet", label: "Distance from pivot to sprinkler outlet" },
            { value: "linear", label: "Uniform spacing (no outlet distance)" },
          ]}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Sprinkler GPM" value={fmt(result.sprinklerGpm)} />
        <Result label="Sprinkler LPS" value={fmt(result.sprinklerLps, 3)} />
        <Result label="IAR, in/hr" value={fmt(result.iarInHr)} />
        <Result label="IAR, mm/hr" value={fmt(result.iarMmHr, 1)} />
      </div>
    </DesignChrome>
  );
}
