import { DEFAULT_END_GUN, type EndGunInput } from "./end-gun";
import { DEFAULT_GPM_IAR } from "./gpm-iar";
import { DEFAULT_JOB, type DesignJob } from "./job";
import type { MainlineElectricalInput } from "./mainline-electrical";
import type { MainlinePressureInput } from "./mainline-pressure";
import type { PivotPressureInput } from "./pivot-pressure";
import { DEFAULT_SUMMARY, type SummaryInput } from "./summary";
import type { LinearTimerInput, PivotTimerInput } from "./timers";
import { DEFAULT_ELECTRIC, type PivotElectricInput } from "./types";

export const DEFAULT_PRESSURE: PivotPressureInput = {
  pivotGpm: 800,
  cFactor: 150,
  endGunRadiusFt: 100,
  booster: "2hp",
  spans: [
    { quantity: 0, lengthFt: 160, diameterId: "10" },
    { quantity: 0, lengthFt: 180, diameterId: "8-5/8" },
    { quantity: 0, lengthFt: 180, diameterId: "6-5/8" },
    { quantity: 0, lengthFt: 185, diameterId: "6-5/8" },
    { quantity: 6, lengthFt: 205, diameterId: "6-5/8" },
    { quantity: 0, lengthFt: 0, diameterId: "6-5/8" },
    { quantity: 0, lengthFt: 0, diameterId: "6-5/8" },
  ],
  overhangFt: 54,
  overhangDiameterId: "6-5/8",
  elevationFt: 10,
  regulatorPsi: 10,
  unregulatedElevationFt: 10,
  unregulatedEndPsi: 10,
};

export const DEFAULT_MAINLINE_ELEC: MainlineElectricalInput = {
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

export const DEFAULT_MAINLINE_PSI: MainlinePressureInput = {
  gpm: 800,
  lengthFt: 640,
  cIndex: 1,
  pipeKind: "pip",
  nomSize: 8,
  psiRating: 125,
  customOd: 8,
  customWall: 0.105,
};

export const DEFAULT_PIVOT_TIMER: PivotTimerInput = {
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

export const DEFAULT_LINEAR_TIMER: LinearTimerInput = {
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

export type GpmIarExtras = typeof DEFAULT_GPM_IAR;

export type ProjectSnapshot = {
  job: DesignJob;
  electric: PivotElectricInput;
  pressure: PivotPressureInput;
  mainlineElec: MainlineElectricalInput;
  mainlinePsi: MainlinePressureInput;
  pivotTimer: PivotTimerInput;
  linearTimer: LinearTimerInput;
  endGun: EndGunInput;
  gpmIar: GpmIarExtras;
  summary: SummaryInput;
};

export const EMPTY_SNAPSHOT: ProjectSnapshot = {
  job: DEFAULT_JOB,
  electric: DEFAULT_ELECTRIC,
  pressure: DEFAULT_PRESSURE,
  mainlineElec: DEFAULT_MAINLINE_ELEC,
  mainlinePsi: DEFAULT_MAINLINE_PSI,
  pivotTimer: DEFAULT_PIVOT_TIMER,
  linearTimer: DEFAULT_LINEAR_TIMER,
  endGun: DEFAULT_END_GUN,
  gpmIar: DEFAULT_GPM_IAR,
  summary: DEFAULT_SUMMARY,
};

export { DEFAULT_ELECTRIC };
