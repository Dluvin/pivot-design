import { BOOST_HP2, BOOST_HP5, BOOST_HP75, SR100_ANFL_TO_NOZZLE, SR100_DOWNSIZE, SR100_NOZZLES } from "./nelson-tables";
import { vlookupSorted } from "./utils";

export type EndGunInput = {
  pivotGpm: number;
  distanceToLrdu: number;
  overhangFt: number;
  endPressurePsi: number;
  degrees: number;
  endGunOnPct: number;
};

export type EndGunOption = {
  label: string;
  maxGpm: number;
  boostPsi: number;
  nozzlePsi: number;
  nozzleSize: number;
  reqGpm: number;
  actualGpm: number;
  radiusFt: number;
  acres: number;
  waterWarn: string;
  waterPct: number | null;
  negativePsi: boolean;
};

function nozzleBySize(size: number) {
  let found = SR100_NOZZLES[0];
  for (const n of SR100_NOZZLES) {
    if (n.size <= size + 1e-9) found = n;
    else break;
  }
  return found;
}

function downsizeNozzle(size: number) {
  for (const [from, to] of SR100_DOWNSIZE) {
    if (Math.abs(from - size) < 1e-9) return to ?? size;
  }
  return size;
}

function areaGpm(pivotGpm: number, throwFt: number, lrdu: number, oh: number) {
  const outer = throwFt + lrdu + oh;
  const inner = lrdu + oh;
  if (outer <= 0) return 0;
  return pivotGpm * ((outer ** 2 - inner ** 2) / outer ** 2);
}

function acresFor(input: EndGunInput, radiusFt: number) {
  const base = input.distanceToLrdu + input.overhangFt;
  const on = input.endGunOnPct;
  return (((on * (base + radiusFt) ** 2 + (1 - on) * base ** 2) * Math.PI) / 43560) * (input.degrees / 360);
}

function boosterLosses(gpm: number, overhangFt: number) {
  const bpFric = Math.max(0, 0.050545 * gpm - 2.7372219);
  const valve = 0.34739371 * 1.01484075 ** gpm;
  const hose = (10.46 * 3 * (gpm / 150) ** 1.85 / 2 ** 4.8655) / 2.31;
  const pipe = (10.46 * overhangFt * (gpm / 150) ** 1.85 / 2.5 ** 4.8655) / 2.31;
  return bpFric + valve + hose + pipe;
}

function noBoosterLosses(gpm: number) {
  const valve = 0.34739371 * 1.01484075 ** gpm;
  const nipple = (10.46 * (4.5 / 12) * (gpm / 150) ** 1.85 / 2 ** 4.8655) / 2.31;
  return valve + nipple;
}

function throwFromNozzle(size: number, psi: number) {
  const n = nozzleBySize(size);
  const p = psi > 0 ? psi : 30;
  return n.throwA * p ** n.throwB * 0.8;
}

function gpmFromNozzle(size: number, psi: number) {
  const n = nozzleBySize(size);
  const p = psi > 0 ? psi : 30;
  return n.anfl * Math.sqrt(p);
}

function boosterPass(
  throwGuess: number,
  maxGpm: number,
  curve: [number, number][],
  input: EndGunInput,
) {
  const req = Math.min(areaGpm(input.pivotGpm, throwGuess, input.distanceToLrdu, input.overhangFt), maxGpm);
  const headFt = vlookupSorted(curve, req);
  const boostPsi = headFt / 2.31;
  const loss = boosterLosses(req, input.overhangFt);
  const psi = input.endPressurePsi + boostPsi - loss;
  const anfl = psi > 0 ? req / Math.sqrt(psi) : req / Math.sqrt(30);
  const nozzle = vlookupSorted(SR100_ANFL_TO_NOZZLE, anfl, 0.5);
  return {
    req,
    boostPsi,
    psi,
    nozzle,
    actualGpm: gpmFromNozzle(nozzle, psi),
    throwFt: throwFromNozzle(nozzle, psi),
  };
}

function finishBooster(
  label: string,
  maxGpm: number,
  curve: [number, number][],
  input: EndGunInput,
): EndGunOption {
  let throwFt = 100;
  let pass = boosterPass(throwFt, maxGpm, curve, input);
  for (let i = 0; i < 2; i++) {
    throwFt = pass.throwFt;
    pass = boosterPass(throwFt, maxGpm, curve, input);
  }
  const needed = areaGpm(input.pivotGpm, pass.throwFt, input.distanceToLrdu, input.overhangFt);
  let nozzle = pass.nozzle;
  let actualGpm = pass.actualGpm;
  let radiusFt = pass.throwFt;
  if (needed > maxGpm || actualGpm > maxGpm) {
    nozzle = downsizeNozzle(nozzle);
    actualGpm = gpmFromNozzle(nozzle, pass.psi);
    radiusFt = throwFromNozzle(nozzle, pass.psi);
  }
  const reqGpm = Math.min(needed, maxGpm);
  return packageOption(label, maxGpm, pass.boostPsi, pass.psi, nozzle, reqGpm, actualGpm, radiusFt, input);
}

function noBoosterPass(throwGuess: number, input: EndGunInput) {
  const req = areaGpm(input.pivotGpm, throwGuess, input.distanceToLrdu, input.overhangFt);
  const psi = input.endPressurePsi - noBoosterLosses(req);
  const anfl = psi > 0 ? req / Math.sqrt(psi) : req / Math.sqrt(30);
  const nozzle = vlookupSorted(SR100_ANFL_TO_NOZZLE, Math.max(anfl, 0), 0.5);
  return {
    req,
    psi,
    nozzle,
    actualGpm: gpmFromNozzle(nozzle, psi),
    throwFt: throwFromNozzle(nozzle, psi),
  };
}

function finishNoBooster(input: EndGunInput): EndGunOption {
  let throwFt = 100;
  let pass = noBoosterPass(throwFt, input);
  for (let i = 0; i < 2; i++) {
    throwFt = pass.throwFt;
    pass = noBoosterPass(throwFt, input);
  }
  return packageOption("No booster", 0, 0, pass.psi, pass.nozzle, pass.req, pass.actualGpm, pass.throwFt, input);
}

function packageOption(
  label: string,
  maxGpm: number,
  boostPsi: number,
  nozzlePsi: number,
  nozzleSize: number,
  reqGpm: number,
  actualGpm: number,
  radiusFt: number,
  input: EndGunInput,
): EndGunOption {
  let waterWarn = "";
  let waterPct: number | null = null;
  if (reqGpm > 0 && (reqGpm - actualGpm) / reqGpm > 0.1) {
    waterWarn = "EG Will Underwater By:";
    waterPct = (reqGpm - actualGpm) / reqGpm;
  } else if (reqGpm > 0 && (actualGpm - reqGpm) / reqGpm > 0.25) {
    waterWarn = "EG Will Overwater By:";
    waterPct = (actualGpm - reqGpm) / reqGpm;
  }
  return {
    label,
    maxGpm,
    boostPsi,
    nozzlePsi,
    nozzleSize,
    reqGpm,
    actualGpm,
    radiusFt,
    acres: acresFor(input, radiusFt),
    waterWarn,
    waterPct,
    negativePsi: nozzlePsi < 0,
  };
}

export function computeEndGun(input: EndGunInput) {
  const hp2 = finishBooster("2 HP", 130, BOOST_HP2, input);
  const hp5 = finishBooster("5 HP", 175, BOOST_HP5, input);
  const hp75 = finishBooster("7 1/2 HP", 230, BOOST_HP75, input);
  const none = finishNoBooster(input);
  const options = [hp2, hp5, hp75, none];
  const lowPsi = options.some((o) => !o.negativePsi && o.nozzlePsi < 40);
  const warnings: string[] = [];
  if (lowPsi) warnings.push("Nelson SR100 should not be operated at less than 40 psi (2.8 bar).");
  if (none.negativePsi) warnings.push("Negative end gun pressure — raise end pressure or add a booster.");
  return { hp2, hp5, hp75, none, options, warnings, lowPsi };
}

export const DEFAULT_END_GUN: EndGunInput = {
  pivotGpm: 800,
  distanceToLrdu: 1105.5,
  overhangFt: 54,
  endPressurePsi: 15,
  degrees: 360,
  endGunOnPct: 1,
};
