import { FRICTION_PERCENT, PIPE_DIAMETERS } from "./lookups";

export type PressureSpan = { quantity: number; lengthFt: number; diameterId: string };

export type PivotPressureInput = {
  pivotGpm: number;
  cFactor: number;
  endGunRadiusFt: number;
  booster: "none" | "2hp" | "5hp" | "7.5hp";
  spans: PressureSpan[];
  overhangFt: number;
  overhangDiameterId: string;
  elevationFt: number;
  regulatorPsi: number;
  unregulatedElevationFt: number;
  unregulatedEndPsi: number;
};

/** Valley 1.52 booster max GPM (2 / 5 / 7.5 HP). */
export const BP_GPM = { none: 0, "2hp": 130, "5hp": 175, "7.5hp": 230 };

function lookupFriction(percent: number) {
  const rounded = Math.round(percent);
  if (rounded <= 0) return 0;
  return FRICTION_PERCENT[Math.min(Math.max(rounded, 1), 100) - 1] ?? 1;
}

export function computePivotPressure(input: PivotPressureInput) {
  const lengths = PIPE_DIAMETERS.map((d) => {
    let length = input.spans.filter((s) => s.diameterId === d.id).reduce((sum, s) => sum + s.quantity * s.lengthFt, 0);
    if (d.id === input.overhangDiameterId) length += input.overhangFt;
    return { id: d.id, label: d.label, pipeFactor: d.factor, length };
  });
  const totalLength = lengths.reduce((s, g) => s + g.length, 0) || 1;
  const cMult = (150 / Math.max(input.cFactor, 1)) ** 1.85;
  const all658Psi = (totalLength + input.endGunRadiusFt) * (input.pivotGpm / 12180) ** 1.85 * cMult;

  const staged = lengths.map((g, index) => {
    const cumLength = lengths.slice(0, index + 1).reduce((s, x) => s + x.length, 0);
    const used = g.length > 0 ? cumLength : 0;
    const pct = (used / totalLength) * 100;
    const table = used === 0 ? 0 : lookupFriction(pct);
    return { ...g, used, pct, table, share: 0, psi: 0 };
  });
  for (let i = 0; i < staged.length; i++) {
    if (staged[i].used <= 0) continue;
    const prevMax = Math.max(0, ...staged.slice(0, i).map((p) => p.table));
    staged[i].share = staged[i].table - prevMax;
    staged[i].psi = staged[i].share * all658Psi * staged[i].pipeFactor;
  }

  const sumPsi = staged.reduce((s, p) => s + p.psi, 0);
  const calculatedPsi = sumPsi * cMult;
  const regulatorAdder = input.regulatorPsi === 6 ? 4 : 5;
  const pivotPressureReg = input.regulatorPsi + regulatorAdder + input.elevationFt / 2.31 + calculatedPsi;
  const throwRadius = totalLength + input.endGunRadiusFt;
  const endGunGpm = throwRadius === 0 ? 0 : input.pivotGpm * ((throwRadius ** 2 - totalLength ** 2) / throwRadius ** 2);
  const maxBp = BP_GPM[input.booster];
  const underwater = input.booster !== "none" && endGunGpm > maxBp ? (endGunGpm - maxBp) / endGunGpm : 0;
  const unregulatedPivot = input.unregulatedEndPsi + input.unregulatedElevationFt / 2.31 + calculatedPsi;
  const flowDeviation = input.unregulatedEndPsi ? Math.abs(input.unregulatedElevationFt / (4.62 * input.unregulatedEndPsi)) : 0;

  return {
    totalLength,
    all658Psi,
    cMult,
    calculatedPsi,
    regulatorAdder,
    pivotPressureReg,
    endGunGpm,
    maxBp,
    underwater,
    unregulatedPivot,
    flowDeviation,
    parts: staged,
  };
}
