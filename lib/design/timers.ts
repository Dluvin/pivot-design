import { TIMER_RPM, TIRES } from "./lookups";
import { inchSteps } from "./utils";

export type PivotTimerInput = {
  distanceToLrdu: number;
  overhangFt: number;
  endGunThrowFt: number;
  pivotGpm: number;
  degrees: number;
  endGunOnPct: number;
  tireId: number;
  measuredFtPerMin: number;
  gearboxValley: boolean;
  hertz60: boolean;
  rpmCode: number;
};

export function ftPerMin(opts: {
  tireId: number;
  measuredFtPerMin: number;
  gearboxValley: boolean;
  hertz60: boolean;
  rpmCode: number;
}) {
  const tire = TIRES.find((t) => t.id === opts.tireId);
  if (!tire) return 0;
  if (tire.id === 7) return opts.measuredFtPerMin;
  const gearbox = opts.gearboxValley ? 52 : 50;
  const hz = opts.hertz60 ? 60 : 50;
  const rpm = opts.rpmCode === 12 ? 20 : (TIMER_RPM[opts.rpmCode] ?? 0);
  return ((rpm * (hz / 60)) / gearbox) * (tire.circumference / 12);
}

export function computePivotTimer(input: PivotTimerInput) {
  const speed = ftPerMin(input);
  const r = input.distanceToLrdu;
  const oh = input.overhangFt;
  const eg = input.endGunThrowFt;
  const endGunGpm = input.pivotGpm * (((oh + r + eg) ** 2 - (oh + r) ** 2) / Math.max((oh + r + eg) ** 2, 1));
  const acresEg =
    (((input.endGunOnPct * (oh + r + eg) ** 2 + (1 - input.endGunOnPct) * (r + oh) ** 2) * Math.PI) / 43560) *
    (input.degrees / 360);
  const acresFull = ((oh + r + eg) ** 2 * Math.PI) / 43560 * (input.degrees / 360);
  const gpmAcre = acresFull ? input.pivotGpm / acresFull : 0;
  const inchesDay = 0.053 * (acresEg ? input.pivotGpm / acresEg : 0);
  const hours100 = speed ? ((2 * Math.PI) / 60) * r / speed * (input.degrees / 360) : 0;
  const inches100 = ((gpmAcre * 0.053) * hours100) / 24;
  const depths = inchSteps(inches100);
  const rows = depths.map((inches) => {
    const timer = inches100 && inches ? (inches100 / inches) * 100 : 0;
    const hours = timer ? (hours100 / timer) * 100 : 0;
    return { timer, hours, inches };
  });
  return {
    speed,
    endGunGpm,
    acresEg,
    acresFull,
    gpmAcre: acresEg ? input.pivotGpm / acresEg : 0,
    inchesDay,
    hours100,
    inches100,
    partRev: input.degrees !== 360,
    rows,
  };
}

export type LinearTimerInput = {
  linearLengthFt: number;
  endGunThrowFt: number;
  linearGpm: number;
  runFt: number;
  tireId: number;
  measuredFtPerMin: number;
  gearboxValley: boolean;
  hertz60: boolean;
  rpmCode: number;
};

export function computeLinearTimer(input: LinearTimerInput) {
  const speed = ftPerMin(input);
  const width = input.linearLengthFt + input.endGunThrowFt;
  const acres = (width * input.runFt) / 43560;
  const gpmAcre = acres ? input.linearGpm / acres : 0;
  const inchesDay = width && input.runFt ? (input.linearGpm * 2310) / (width * input.runFt) : 0;
  const hours100 = speed ? input.runFt / (speed * 60) : 0;
  const inches100 = speed && width ? (input.linearGpm * 1.6) / (speed * width) : 0;
  const depths = inchSteps(inches100);
  const rows = depths.map((inches) => {
    const timer = inches100 && inches ? (inches100 / inches) * 100 : 0;
    const hours = timer ? (hours100 / timer) * 100 : 0;
    return { timer, hours, inches };
  });
  return { speed, acres, gpmAcre, inchesDay, hours100, inches100, rows };
}
