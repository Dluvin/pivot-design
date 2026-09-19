"use client";

import { DesignChrome } from "@/components/design/DesignChrome";
import {
  ALUM_WIRE,
  COPPER_WIRE,
  FRICTION_PERCENT,
  GENERATOR_TABLE,
  HELICAL_HIGH_GEN,
  HELICAL_STD_GEN,
  HW_C,
  IPS_PIPE,
  MOTOR_CURRENT,
  PIPE_DIAMETERS,
  PIP_PIPE,
  TIMER_RPM,
  TIRES,
  WIRE_FACTOR,
} from "@/lib/design/lookups";
import { BOOST_HP2, BOOST_HP5, BOOST_HP75, SR100_NOZZLES } from "@/lib/design/nelson-tables";

function Table({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-1.5">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ReferenceTables() {
  return (
    <DesignChrome
      title="Reference tables"
      subtitle="Copied from Pivot Design 1.0 / 1.52: pipe, wire, motors, generators, tires, friction, and Nelson SR100."
      active="tables"
    >
      <Table
        title="Motor current (A)"
        headers={["HP", "60 Hz", "50 Hz"]}
        rows={MOTOR_CURRENT.map((r) => [String(r.hp), r.hz60, r.hz50])}
      />
      <Table
        title="Span wire factor"
        headers={["Gauge", "Factor"]}
        rows={Object.entries(WIRE_FACTOR).map(([g, f]) => [g, f])}
      />
      <Table
        title="Generator frame table"
        headers={["Min kW", "Size kW", "Efficiency", "Frame"]}
        rows={GENERATOR_TABLE.map((r) => [r.minKw, r.sizeKw, r.efficiency, r.frame])}
      />
      <Table
        title="Helical standard generator kW (none / 2 / 5 / 7.5 HP BP)"
        headers={["Drive units", "None", "2 HP", "5 HP", "7.5 HP"]}
        rows={Object.entries(HELICAL_STD_GEN).map(([n, row]) => [n, row[0] ?? "—", row[1] ?? "—", row[2] ?? "—", row[3] ?? "—"])}
      />
      <Table
        title="Helical high-speed generator kW"
        headers={["Drive units", "None", "2 HP", "5 HP", "7.5 HP"]}
        rows={Object.entries(HELICAL_HIGH_GEN).map(([n, row]) => [n, row[0] ?? "—", row[1] ?? "—", row[2] ?? "—", row[3] ?? "—"])}
      />
      <Table
        title="Pivot span pipe factors"
        headers={["ID", "Label", "Factor vs 6-5/8"]}
        rows={PIPE_DIAMETERS.map((p) => [p.id, p.label, p.factor])}
      />
      <Table
        title="Multiple-outlet friction percent (1–100%)"
        headers={["Percent of length", "Table"]}
        rows={FRICTION_PERCENT.map((v, i) => [i + 1, v])}
      />
      <Table
        title="PIP plastic irrigation pipe (OD and wall, in)"
        headers={["Nom.", "OD", "50 psi", "80 psi", "100 psi", "125 psi"]}
        rows={Object.entries(PIP_PIPE).map(([nom, row]) => [
          nom,
          row.od,
          row.wall[50] ?? "—",
          row.wall[80] ?? "—",
          row.wall[100] ?? "—",
          row.wall[125] ?? "—",
        ])}
      />
      <Table
        title="IPS thermoplastic pipe (OD and wall, in)"
        headers={["Nom.", "OD", "100 psi", "125 psi", "160 psi", "200 psi"]}
        rows={Object.entries(IPS_PIPE).map(([nom, row]) => [
          nom,
          row.od,
          row.wall[100],
          row.wall[125],
          row.wall[160],
          row.wall[200],
        ])}
      />
      <Table title="Hazen-Williams C" headers={["Index", "C"]} rows={Object.entries(HW_C).map(([i, c]) => [i, c])} />
      <Table
        title="Copper feeder (table 80 / 60 and ampacity)"
        headers={["Size", "PF 0.8 table", "PF 0.6 table", "Ampacity"]}
        rows={COPPER_WIRE.map((w) => [w.size, w.pf80, w.pf60, w.ampacity])}
      />
      <Table
        title="Aluminum feeder"
        headers={["Size", "PF 0.8 table", "PF 0.6 table", "Ampacity"]}
        rows={ALUM_WIRE.map((w) => [w.size, w.pf80, w.pf60, w.ampacity])}
      />
      <Table title="Timer RPM codes" headers={["Code", "RPM"]} rows={Object.entries(TIMER_RPM).map(([c, r]) => [c, r])} />
      <Table
        title="Tires"
        headers={["ID", "Size", "Circumference, in"]}
        rows={TIRES.map((t) => [t.id, t.label, t.circumference || "measured"])}
      />
      <Table
        title="Nelson SR100 nozzles"
        headers={["Size", "ANFL", "Throw A", "Throw B"]}
        rows={SR100_NOZZLES.map((n) => [n.size, n.anfl, n.throwA, n.throwB])}
      />
      <Table title="2 HP booster (GPM → head, ft)" headers={["GPM", "Head, ft"]} rows={BOOST_HP2.map(([q, h]) => [q, h])} />
      <Table title="5 HP booster (GPM → head, ft)" headers={["GPM", "Head, ft"]} rows={BOOST_HP5.map(([q, h]) => [q, h])} />
      <Table title="7½ HP booster (GPM → head, ft)" headers={["GPM", "Head, ft"]} rows={BOOST_HP75.map(([q, h]) => [q, h])} />
    </DesignChrome>
  );
}
