"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { computeEndGun } from "@/lib/design/end-gun";
import { computeFusing, fusingLineItems } from "@/lib/design/fusing";
import { computeGpmIar } from "@/lib/design/gpm-iar";
import { computeMainlineElectrical } from "@/lib/design/mainline-electrical";
import { computeMainlinePressure } from "@/lib/design/mainline-pressure";
import { computePivotElectric } from "@/lib/design/pivot-electric";
import { computePivotPressure } from "@/lib/design/pivot-pressure";
import { computeSummary } from "@/lib/design/summary";
import { EMPTY_SNAPSHOT, type ProjectSnapshot } from "@/lib/design/defaults";
import { readWorkspace, RELOAD_EVENT } from "@/lib/design/project";
import { computeLinearTimer, computePivotTimer } from "@/lib/design/timers";
import { fmt, Result } from "@/components/design/DesignChrome";
import { PrintBrand } from "@/components/design/PrintBrand";

function Sheet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-sheet rounded-xl border border-stone-200 bg-white p-5 print:rounded-none print:border-0 print:p-0">
      {children}
    </section>
  );
}

function Mini({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return <Result label={label} value={value} warn={warn} />;
}

export function PrintPackage() {
  const [snap, setSnap] = useState<ProjectSnapshot>(EMPTY_SNAPSHOT);
  useEffect(() => {
    function load() {
      setSnap(readWorkspace());
    }
    load();
    window.addEventListener(RELOAD_EVENT, load);
    return () => window.removeEventListener(RELOAD_EVENT, load);
  }, []);

  const job = snap.job;
  const electric = computePivotElectric(snap.electric);
  const fusing = computeFusing(electric, snap.electric.booster, snap.electric.machineSpeed);
  const mainElec = computeMainlineElectrical({
    ...snap.mainlineElec,
    pivotAmps: electric.systemCurrent,
    spanVoltageDrop: electric.voltageDrop,
  });
  const pressure = computePivotPressure(snap.pressure);
  const mainPsi = computeMainlinePressure(snap.mainlinePsi);
  const pivotTimer = computePivotTimer(snap.pivotTimer);
  const linearTimer = computeLinearTimer(snap.linearTimer);
  const endGun = computeEndGun({
    ...snap.endGun,
    pivotGpm: snap.job.pivotGpm || snap.pressure.pivotGpm,
    distanceToLrdu: snap.pivotTimer.distanceToLrdu,
    overhangFt: snap.pressure.overhangFt,
    degrees: snap.pivotTimer.degrees,
    endGunOnPct: snap.pivotTimer.endGunOnPct,
    endPressurePsi: snap.pressure.regulatorPsi + pressure.regulatorAdder,
  });
  const gpmIar = computeGpmIar({
    machineGpm: snap.job.pivotGpm || snap.pressure.pivotGpm,
    lengthToEgFt: pressure.totalLength,
    endGunRadiusFt: snap.pressure.endGunRadiusFt,
    wettedDiameterFt: snap.gpmIar.wettedDiameterFt,
    spacingFt: snap.gpmIar.spacingFt,
    outletMode: snap.gpmIar.outletMode,
    outletDistanceFt: pressure.totalLength,
  });
  const designSummary = computeSummary({
    summary: snap.summary,
    electric: snap.electric,
    pressure: snap.pressure,
    mainlinePsi: snap.mainlinePsi,
    pivotTimer: snap.pivotTimer,
    pivotGpm: snap.job.pivotGpm || snap.pressure.pivotGpm,
  });
  const velHigh = mainPsi.velocity > 5;
  const velMpsHigh = mainPsi.velocityMps > 1.6;

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Print package</h1>
          <p className="mt-1 text-stone-600">
            All worksheets with your logo and business name. Use Print to save as PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold">
            Back to job
          </Link>
          <button
            type="button"
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="space-y-8 print:space-y-0">
        <Sheet title="Cover">
          <PrintBrand sheet="Design package" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Job</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Customer</dt>
              <dd className="font-medium">{job.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Field</dt>
              <dd className="font-medium">{job.fieldName || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Address</dt>
              <dd>{job.address || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Phone</dt>
              <dd>{job.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Salesperson</dt>
              <dd>{job.salesperson || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Dealership</dt>
              <dd>{job.dealership || "—"}</dd>
            </div>
          </dl>
          {job.comments ? <p className="mt-3 text-sm">{job.comments}</p> : null}
        </Sheet>

        <Sheet title="Electric">
          <PrintBrand sheet="Center pivot amp draw & voltage drop" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Pivot electric</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="System current, A" value={fmt(electric.systemCurrent)} />
            <Mini label="Voltage drop, V" value={fmt(electric.voltageDrop)} />
            <Mini label="Last tower voltage" value={fmt(electric.lastTowerVoltage)} />
            <Mini label="Length to LRDU, ft" value={fmt(electric.lengthToLrdu, 0)} />
            <Mini label="Power, kW" value={fmt(electric.powerKw)} />
            <Mini label="Generator HP" value={fmt(electric.generatorHp)} />
            <Mini label="kW gen (min)" value={fmt(electric.generatorKwMin, 1)} />
            <Mini label="kW gen (rec.)" value={electric.generatorKwRec == null ? "—" : fmt(electric.generatorKwRec, 1)} />
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="py-1">#</th>
                <th>Length</th>
                <th>Wire</th>
                <th>HP</th>
                <th>Amps</th>
                <th>Volts</th>
              </tr>
            </thead>
            <tbody>
              {electric.spans.map((row) => (
                <tr key={row.number} className="border-t border-stone-100">
                  <td className="py-1">{row.number}</td>
                  <td>{row.lengthFt}</td>
                  <td>{row.wireGauge}</td>
                  <td>{typeof row.motorHp === "number" ? fmt(row.motorHp, 1) : row.motorHp}</td>
                  <td>{fmt(row.current)}</td>
                  <td>{fmt(row.voltage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <Sheet title="Fusing">
          <PrintBrand sheet="Fusing report" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Fusing report</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="py-1">Qty</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {fusingLineItems(fusing).map((row) => (
                <tr key={row.label} className="border-t border-stone-100">
                  <td className="py-1 font-semibold">{row.qty}</td>
                  <td>{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <Sheet title="Mainline electrical">
          <PrintBrand sheet="Mainline electrical" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Mainline electrical</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Mini label="Total amps" value={fmt(mainElec.totalAmps)} />
            <Mini label="Allowable drop, V" value={fmt(mainElec.allow)} />
            <Mini label="Copper size" value={mainElec.required.copper?.size ?? "—"} />
            <Mini label="Aluminum size" value={mainElec.required.aluminum?.size ?? "—"} />
            <Mini label="Cu end V" value={mainElec.required.copper ? fmt(mainElec.required.copper.endVoltage) : "—"} />
            <Mini label="Al end V" value={mainElec.required.aluminum ? fmt(mainElec.required.aluminum.endVoltage) : "—"} />
          </div>
        </Sheet>

        <Sheet title="Pivot pressure">
          <PrintBrand sheet="Center pivot pressure loss" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Pivot pressure</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="Total length, ft" value={fmt(pressure.totalLength, 0)} />
            <Mini label="Friction, psi" value={fmt(pressure.calculatedPsi)} />
            <Mini label="Reg. pivot psi" value={fmt(pressure.pivotPressureReg)} />
            <Mini label="End gun GPM" value={fmt(pressure.endGunGpm, 1)} />
          </div>
        </Sheet>

        <Sheet title="Mainline pressure">
          <PrintBrand sheet="Mainline pressure loss" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Mainline pressure</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="Pipe ID, in" value={fmt(mainPsi.id, 3)} />
            <Mini label="Friction, psi" value={fmt(mainPsi.psi)} />
            <Mini label="Velocity, ft/s" value={fmt(mainPsi.velocity)} warn={velHigh} />
            <Mini label="Velocity, m/s" value={fmt(mainPsi.velocityMps, 3)} warn={velMpsHigh} />
          </div>
          {velHigh ? (
            <p className="mt-3 text-sm font-semibold text-red-700">Warning — velocity exceeds 5.0 ft/s.</p>
          ) : null}
          {velMpsHigh ? (
            <p className="mt-3 text-sm font-semibold text-red-700">Warning — velocity exceeds 1.6 m/s.</p>
          ) : null}
        </Sheet>

        <Sheet title="End gun">
          <PrintBrand sheet="End gun radius" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">End gun radius</h2>
          {endGun.warnings.length ? (
            <p className="mt-2 text-sm font-semibold text-red-700">{endGun.warnings.join(" ")}</p>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {endGun.options.map((opt) => (
              <Mini
                key={opt.label}
                label={`${opt.label} radius, ft`}
                value={fmt(opt.radiusFt, 1)}
                warn={opt.nozzlePsi < 40 || opt.negativePsi}
              />
            ))}
          </div>
        </Sheet>

        <Sheet title="GPM IAR">
          <PrintBrand sheet="Sprinkler GPM & IAR" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">GPM & IAR</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="Sprinkler GPM" value={fmt(gpmIar.sprinklerGpm)} />
            <Mini label="IAR, in/hr" value={fmt(gpmIar.iarInHr)} />
          </div>
        </Sheet>

        <Sheet title="Summary">
          <PrintBrand sheet="Design summary" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Design summary</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="Acres" value={fmt(designSummary.acres, 2)} />
            <Mini label="GPM / acre" value={fmt(designSummary.gpmAcre, 2)} />
            <Mini label="TDH, ft" value={fmt(designSummary.tdhFt)} />
            <Mini label="Brake HP" value={fmt(designSummary.brakeHp)} />
            <Mini label="Annual cost" value={`$${fmt(designSummary.annualCost, 0)}`} />
          </div>
        </Sheet>

        <Sheet title="Pivot timer">
          <PrintBrand sheet="Pivot percent timer chart" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Pivot timer</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="Speed, ft/min" value={fmt(pivotTimer.speed)} />
            <Mini label="Acres" value={fmt(pivotTimer.acresEg, 1)} />
            <Mini label="GPM / acre" value={fmt(pivotTimer.gpmAcre, 1)} />
            <Mini label="Hours @ 100%" value={fmt(pivotTimer.hours100, 1)} />
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="py-1">% timer</th>
                <th>Hours</th>
                <th>Inches</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 font-medium">100</td>
                <td>{fmt(pivotTimer.hours100, 1)}</td>
                <td>{fmt(pivotTimer.inches100)}</td>
              </tr>
              {pivotTimer.rows.slice(0, 12).map((row) => (
                <tr key={row.inches} className="border-t border-stone-100">
                  <td className="py-1">{fmt(row.timer, 1)}</td>
                  <td>{fmt(row.hours, 1)}</td>
                  <td>{fmt(row.inches)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <Sheet title="Linear timer">
          <PrintBrand sheet="Linear percent timer chart" customer={job.name} fieldName={job.fieldName} preview />
          <h2 className="font-display text-2xl print:hidden">Linear timer</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Mini label="Speed, ft/min" value={fmt(linearTimer.speed)} />
            <Mini label="Acres" value={fmt(linearTimer.acres, 1)} />
            <Mini label="GPM / acre" value={fmt(linearTimer.gpmAcre, 1)} />
            <Mini label="Hours / pass @ 100%" value={fmt(linearTimer.hours100, 1)} />
          </div>
        </Sheet>
      </div>
    </div>
  );
}
