import { BOOSTER_LABEL, type Booster, type PivotElectricResult } from "./types";
import { eq } from "./utils";

export type FusingResult = {
  panel45: number;
  phaseLoss30: number;
  fuse8to10: number;
  fuse10to12: number;
  booster45_2hp: number;
  booster5hp: number;
  booster75hp: number;
  standardDrivePackages: number;
  highDrivePackages: number;
};

export function computeFusing(electric: PivotElectricResult, booster: Booster, speed: "standard" | "high"): FusingResult {
  const amps = electric.systemCurrent;
  const gauges = electric.spans.filter((s) => typeof s.motorHp !== "string").map((s) => s.wireGauge);
  const minG = gauges.length ? Math.min(...gauges) : 0;
  const maxG = gauges.length ? Math.max(...gauges) : 0;
  const bp = BOOSTER_LABEL[booster];
  const panel45 = amps > 30 ? 1 : 0;
  const phaseLoss30 =
    amps < 30 && (eq(bp, "5 HP BP") || eq(bp, "7 1/2 HP BP")) ? 1 : 0;
  const fuse8to10 = amps > 30 && minG === 8 && electric.wireCounts.g10 > 1 ? 1 : 0;
  const fuse10to12 = amps > 20 && maxG === 12 && minG < 12 ? 1 : 0;
  const booster45_2hp = eq(bp, "2 HP BP") && amps > 30 ? 1 : 0;
  const booster5hp = eq(bp, "5 HP BP") ? 1 : 0;
  const booster75hp = eq(bp, "7 1/2 HP BP") ? 1 : 0;
  const bpFuses = booster45_2hp + booster5hp + booster75hp;
  const stdCount = electric.stdMotors;
  const highCount = electric.highMotors;

  let standardDrivePackages = 0;
  let highDrivePackages = 0;
  if (speed === "standard") {
    if (panel45 === 1 && bpFuses < 1) standardDrivePackages = stdCount;
    else if (booster45_2hp || booster5hp || booster75hp) standardDrivePackages = Math.max(0, stdCount - 1);
    else if (amps < 30) standardDrivePackages = bpFuses < 1 ? 0 : stdCount;
    else standardDrivePackages = stdCount;
  } else {
    if (panel45 === 1 && bpFuses < 1) highDrivePackages = highCount;
    else if (booster45_2hp || booster5hp || booster75hp) highDrivePackages = Math.max(0, highCount - 1);
  }

  return {
    panel45,
    phaseLoss30,
    fuse8to10,
    fuse10to12,
    booster45_2hp,
    booster5hp,
    booster75hp,
    standardDrivePackages,
    highDrivePackages,
  };
}
