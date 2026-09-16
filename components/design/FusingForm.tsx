"use client";

import Link from "next/link";
import { DEFAULT_JOB, ELECTRIC_KEY, JOB_KEY, type DesignJob } from "@/lib/design/job";
import { computeFusing } from "@/lib/design/fusing";
import { computePivotElectric } from "@/lib/design/pivot-electric";
import { DEFAULT_ELECTRIC, type PivotElectricInput } from "@/lib/design/types";
import { DesignChrome, JobLine, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";

export function FusingForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [electricInput] = usePersistentState<PivotElectricInput>(ELECTRIC_KEY, DEFAULT_ELECTRIC);
  const electric = computePivotElectric(electricInput);
  const fusing = computeFusing(electric, electricInput.booster, electricInput.machineSpeed);
  const rows = [
    { qty: fusing.panel45, label: "45 amp panel" },
    { qty: fusing.phaseLoss30, label: "30 amp phase loss contactor (5 or 7.5 hp booster without 45 amp panel)" },
    { qty: fusing.fuse8to10, label: "45 amp — 8 ga to 10 ga wire fuse package" },
    { qty: fusing.fuse10to12, label: "30 amp — 10 ga to 12 ga wire fuse package" },
    { qty: fusing.booster45_2hp, label: "45 amp — 2 hp booster pump fuse package" },
    { qty: fusing.booster5hp, label: "5 hp booster pump fuse package" },
    { qty: fusing.booster75hp, label: "7.5 hp booster pump fuse package" },
    { qty: fusing.standardDrivePackages, label: "Standard drive unit fuse package (excludes booster)" },
    { qty: fusing.highDrivePackages, label: "High drive unit fuse package (excludes booster)" },
  ];

  return (
    <DesignChrome title="Fusing report" subtitle="Packages follow the Pivot Electric span and booster setup." active="fusing">
      <JobLine {...job} />
      <p className="text-sm text-stone-600">
        Uses system current {fmt(electric.systemCurrent)} A from{" "}
        <Link href="/pivot-electric" className="font-semibold text-emerald-800 hover:underline">
          Pivot electric
        </Link>
        .
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Item</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => (
              <tr key={row.label} className={row.qty ? "bg-emerald-50/60" : "text-stone-400"}>
                <td className="px-4 py-2 font-semibold">{row.qty}</td>
                <td className="px-4 py-2">{row.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DesignChrome>
  );
}
