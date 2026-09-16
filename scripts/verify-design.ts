import { computeMainlinePressure } from "../lib/design/mainline-pressure";
import { computePivotElectric } from "../lib/design/pivot-electric";
import { computeLinearTimer, computePivotTimer } from "../lib/design/timers";
import { computePivotPressure } from "../lib/design/pivot-pressure";

function check(name: string, got: number, expected: number, tol = 0.15) {
  const ok = Math.abs(got - expected) <= tol;
  console.log(`${ok ? "OK" : "FAIL"} ${name}: got ${got.toFixed(3)} expected ${expected}`);
}

const electric = computePivotElectric({
  pivotVoltage: 500,
  frequencyHz: 60,
  booster: "2hp",
  machineSpeed: "high",
  motorType: "helical",
  boosterTransformer: false,
  spans: [
    { quantity: 8, lengthFt: 180 },
    { quantity: 2, lengthFt: 160 },
    { quantity: 3, lengthFt: 205 },
    { quantity: 0, lengthFt: 0 },
    { quantity: 0, lengthFt: 0 },
    { quantity: 0, lengthFt: 0 },
  ],
  eightGaugeSpans: 0,
  tenGaugeSpans: 12,
  fourteenGaugeLastSpans: 1,
});
check("length", electric.lengthToLrdu, 2375, 0.1);
check("amps", electric.systemCurrent, 20.64, 0.2);
check("kw", electric.powerKw, 14.3, 0.1);
check("gen hp", electric.generatorHp, 22.26, 0.2);
check("min kw", electric.generatorKwMin, 15, 0.1);

const mp = computeMainlinePressure({
  gpm: 800,
  lengthFt: 640,
  cIndex: 1,
  pipeKind: "pip",
  nomSize: 8,
  psiRating: 125,
  customOd: 8,
  customWall: 0.105,
});
check("id", mp.id, 7.658, 0.01);
check("ft", mp.headFt, 7.4, 0.15);
check("psi", mp.psi, 3.2, 0.1);
check("vel", mp.velocity, 5.6, 0.1);

const pt = computePivotTimer({
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
});
check("eg gpm", pt.endGunGpm, 236.5, 1);
check("acres", pt.acresEg, 60.1, 0.2);
check("hours100", pt.hours100, 3.7, 0.1);

const lt = computeLinearTimer({
  linearLengthFt: 2640,
  endGunThrowFt: 0,
  linearGpm: 2500,
  runFt: 5280,
  tireId: 4,
  measuredFtPerMin: 10,
  gearboxValley: true,
  hertz60: true,
  rpmCode: 6,
});
check("lin acres", lt.acres, 320, 0.2);
check("lin hours", lt.hours100, 7.0, 0.15);

const pp = computePivotPressure({
  pivotGpm: 800,
  cFactor: 150,
  endGunRadiusFt: 100,
  booster: "2hp",
  spans: [{ quantity: 6, lengthFt: 205, diameterId: "6-5/8" }],
  overhangFt: 54,
  overhangDiameterId: "6-5/8",
  elevationFt: 10,
  regulatorPsi: 10,
  unregulatedElevationFt: 10,
  unregulatedEndPsi: 10,
});
check("press length", pp.totalLength, 1284, 1);
check("eg gpm press", pp.endGunGpm, 111.4, 1);
check("press psi", pp.calculatedPsi, 9.0, 0.4);
