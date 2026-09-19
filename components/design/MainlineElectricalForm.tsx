"use client";

import Link from "next/link";
import { DEFAULT_JOB, ELECTRIC_KEY, JOB_KEY, MAINLINE_ELEC_KEY, type DesignJob } from "@/lib/design/job";
import { computeMainlineElectrical, type MainlineElectricalInput } from "@/lib/design/mainline-electrical";
import { computePivotElectric } from "@/lib/design/pivot-electric";
import { DEFAULT_ELECTRIC, type PivotElectricInput } from "@/lib/design/types";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";

const DEFAULT_ML: MainlineElectricalInput = {
  powerFactor: 0.6,
  wireLengthFt: 1320,
  pivotAmps: 0,
  additionalAmps: 0,
  sourceVoltage: 490,
  dropMode: "5pct",
  desiredCopper: "0",
  desiredAluminum: "00",
  spanVoltageDrop: 0,
};

export function MainlineElectricalForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [electricInput] = usePersistentState<PivotElectricInput>(ELECTRIC_KEY, DEFAULT_ELECTRIC);
  const electric = computePivotElectric(electricInput);
  const [input, setInput] = usePersistentState<MainlineElectricalInput>(MAINLINE_ELEC_KEY, DEFAULT_ML);
  const live = {
    ...input,
    pivotAmps: electric.systemCurrent,
    spanVoltageDrop: electric.voltageDrop,
  };
  const result = computeMainlineElectrical(live);

  function patch(partial: Partial<MainlineElectricalInput>) {
    setInput({ ...input, ...partial });
  }

  return (
    <DesignChrome title="Mainline electrical" subtitle="Feeder size from pivot amps, run length, and allowable drop." active="mainline-electrical">
      <JobLine {...job} />
      <YellowHint />
      <p className="mt-2 text-sm text-stone-600">
        Pivot amps {fmt(electric.systemCurrent)} and span drop {fmt(electric.voltageDrop)} V come from{" "}
        <Link href="/pivot-electric" className="font-semibold text-emerald-800 hover:underline">
          Pivot electric
        </Link>
        .
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Power factor"
          value={String(input.powerFactor)}
          onChange={(v) => patch({ powerFactor: Number(v) as 0.6 | 0.8 })}
          options={[
            { value: "0.6", label: "0.6 PF" },
            { value: "0.8", label: "0.8 PF" },
          ]}
        />
        <Input label="Wire length, ft" type="number" value={input.wireLengthFt} onChange={(v) => patch({ wireLengthFt: Number(v) })} />
        <Input label="Additional amps" type="number" value={input.additionalAmps} onChange={(v) => patch({ additionalAmps: Number(v) })} />
        <Input label="Source voltage" type="number" value={input.sourceVoltage} onChange={(v) => patch({ sourceVoltage: Number(v) })} />
        <Select
          label="Allowable drop"
          value={input.dropMode}
          onChange={(v) => patch({ dropMode: v as MainlineElectricalInput["dropMode"] })}
          options={[
            { value: "5pct", label: "5% of source" },
            { value: "3pct", label: "3% of source" },
            { value: "10v", label: "10 volts" },
          ]}
        />
        <Input label="Desired copper size" value={input.desiredCopper} onChange={(v) => patch({ desiredCopper: v as MainlineElectricalInput["desiredCopper"] })} />
        <Input
          label="Desired aluminum size"
          value={input.desiredAluminum}
          onChange={(v) => patch({ desiredAluminum: v as MainlineElectricalInput["desiredAluminum"] })}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Total amps" value={fmt(result.totalAmps)} />
        <Result label="Allowable drop, V" value={fmt(result.allow)} />
        <Result label="Max table number" value={fmt(result.tableNumber, 1)} />
      </div>
      {result.warnings.length ? (
        <ul className="mt-3 list-disc pl-5 text-sm text-red-800">
          {result.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {(["required", "desired"] as const).map((kind) => (
          <div key={kind} className="rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="font-display text-lg capitalize">{kind} wire</h2>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                  <th className="py-1"> </th>
                  <th className="py-1">Copper</th>
                  <th className="py-1">Aluminum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1">Size</td>
                  <td>{result[kind].copper?.size ?? "—"}</td>
                  <td>{result[kind].aluminum?.size ?? "—"}</td>
                </tr>
                <tr>
                  <td className="py-1">Ampacity</td>
                  <td>{result[kind].copper ? fmt(result[kind].copper.ampacity, 0) : "—"}</td>
                  <td>{result[kind].aluminum ? fmt(result[kind].aluminum.ampacity, 0) : "—"}</td>
                </tr>
                <tr>
                  <td className="py-1">Mainline drop, V</td>
                  <td>{result[kind].copper ? fmt(result[kind].copper.drop) : "—"}</td>
                  <td>{result[kind].aluminum ? fmt(result[kind].aluminum.drop) : "—"}</td>
                </tr>
                <tr>
                  <td className="py-1">Pivot point, V</td>
                  <td>{result[kind].copper ? fmt(result[kind].copper.pivotVoltage) : "—"}</td>
                  <td>{result[kind].aluminum ? fmt(result[kind].aluminum.pivotVoltage) : "—"}</td>
                </tr>
                <tr>
                  <td className="py-1">Pivot end, V</td>
                  <td className={result[kind].copper && result[kind].copper.endVoltage < result.minEnd ? "text-red-700" : ""}>
                    {result[kind].copper ? fmt(result[kind].copper.endVoltage) : "—"}
                  </td>
                  <td className={result[kind].aluminum && result[kind].aluminum.endVoltage < result.minEnd ? "text-red-700" : ""}>
                    {result[kind].aluminum ? fmt(result[kind].aluminum.endVoltage) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </DesignChrome>
  );
}
