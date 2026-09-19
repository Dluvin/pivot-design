import { computeMainlinePressure, type MainlinePressureInput } from "./mainline-pressure";
import { computePivotElectric } from "./pivot-electric";
import { computePivotPressure, type PivotPressureInput } from "./pivot-pressure";
import { computePivotTimer, type PivotTimerInput } from "./timers";
import type { PivotElectricInput } from "./types";

export type EnergySource = "diesel" | "electric" | "natural gas" | "propane";

export type SummaryInput = {
  inchesPerYear: number;
  efficiency: number;
  energySource: EnergySource;
  dieselGal: number;
  ngMcf: number;
  propaneGal: number;
  electricKwh: number;
  demandOrMaint: number;
  suctionLiftFt: number;
  pumpLiftFt: number;
  columnLossPsi: number;
  hookupPivotPsi: number;
  pivotPointElevPsi: number;
  hookupMainPsi: number;
  riserFt: number;
  elevationFt: number;
  averageAppInches: number;
  pumpEfficiency: number;
};

export const DEFAULT_SUMMARY: SummaryInput = {
  inchesPerYear: 12,
  efficiency: 0.85,
  energySource: "diesel",
  dieselGal: 2,
  ngMcf: 4.5,
  propaneGal: 1.3,
  electricKwh: 0.07,
  demandOrMaint: 250,
  suctionLiftFt: 0,
  pumpLiftFt: 0,
  columnLossPsi: 0,
  hookupPivotPsi: 0,
  pivotPointElevPsi: 0,
  hookupMainPsi: 0,
  riserFt: 12,
  elevationFt: 10,
  averageAppInches: 1,
  pumpEfficiency: 0.75,
};

export function computeSummary(opts: {
  summary: SummaryInput;
  electric: PivotElectricInput;
  pressure: PivotPressureInput;
  mainlinePsi: MainlinePressureInput;
  pivotTimer: PivotTimerInput;
  pivotGpm: number;
}) {
  const electric = computePivotElectric(opts.electric);
  const pressure = computePivotPressure(opts.pressure);
  const mainPsi = computeMainlinePressure(opts.mainlinePsi);
  const timer = computePivotTimer(opts.pivotTimer);
  const gpm = opts.pivotGpm;
  const length = pressure.totalLength;
  const eg = opts.pressure.endGunRadiusFt;
  const degrees = opts.pivotTimer.degrees;
  const egOn = opts.pivotTimer.endGunOnPct;
  const acres =
    (((egOn * (length + eg) ** 2 + (1 - egOn) * length ** 2) * Math.PI) / 43560) * (degrees / 360);
  const gpmAcre = length + eg > 0 ? gpm / (((length + eg) ** 2 * Math.PI) / 43560 * (degrees / 360)) : 0;
  const inchesDay = 0.053 * gpmAcre;

  const sprinklerPsi = opts.pressure.regulatorPsi;
  const regulatorPsi = pressure.regulatorAdder;
  const frictionPsi = pressure.calculatedPsi;
  const elevPsi = opts.summary.elevationFt / 2.31;
  const swivelPsi = sprinklerPsi + regulatorPsi + elevPsi + frictionPsi;
  const lowerRiserPsi = swivelPsi + opts.summary.riserFt / 2.31;
  const pumpDischargePsi =
    lowerRiserPsi +
    opts.summary.hookupPivotPsi +
    opts.summary.pivotPointElevPsi +
    mainPsi.psi +
    opts.summary.hookupMainPsi;
  const tdhFt =
    opts.summary.pumpLiftFt +
    opts.summary.suctionLiftFt +
    pumpDischargePsi * 2.31 +
    opts.summary.columnLossPsi * 2.31;

  const hoursYear =
    opts.summary.efficiency > 0
      ? ((opts.summary.inchesPerYear / 12) * (acres * 43560) * 12 ** 3) / (231 * gpm * 60) / opts.summary.efficiency
      : 0;
  const src = opts.summary.energySource;
  const unitPrice =
    src === "diesel"
      ? opts.summary.dieselGal
      : src === "natural gas"
        ? opts.summary.ngMcf
        : src === "propane"
          ? opts.summary.propaneGal
          : opts.summary.electricKwh;
  const costPerHpHr =
    src === "diesel" ? unitPrice / 16.66 : src === "electric" ? unitPrice / 1.18 : src === "natural gas" ? unitPrice / 82.2 : unitPrice / 9.2;
  const timerFrac = opts.summary.averageAppInches > 0 ? timer.inches100 / opts.summary.averageAppInches : 0;
  const genHpAtApp = timerFrac * electric.generatorHp + (1 - timerFrac) * 0.1 * electric.generatorHp;
  const brakeHp = opts.summary.pumpEfficiency > 0 ? (gpm * tdhFt) / (3960 * opts.summary.pumpEfficiency) : 0;
  const totalHp = genHpAtApp + brakeHp;
  const demand = src === "electric" ? 1000 : opts.summary.demandOrMaint;
  const annualCost = totalHp * costPerHpHr * hoursYear + demand;

  return {
    length,
    eg,
    gpm,
    degrees,
    egOn,
    acres,
    hectares: acres / 2.471,
    gpmAcre,
    lpsHa: gpmAcre * (3.785 / 60) * 2.471,
    inchesDay,
    mmDay: inchesDay * 25.4,
    hoursYear,
    swivelPsi,
    lowerRiserPsi,
    pumpDischargePsi,
    tdhFt,
    tdhPsi: tdhFt / 2.31,
    systemCurrent: electric.systemCurrent,
    voltageDrop: electric.voltageDrop,
    lastTowerVoltage: electric.lastTowerVoltage,
    generatorHp: electric.generatorHp,
    genHpAtApp,
    brakeHp,
    totalHp,
    costPerHpHr,
    annualCost,
    timerFrac,
    frictionPsi,
    mainlinePsi: mainPsi.psi,
  };
}
