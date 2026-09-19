import {
  HELICAL_HIGH_GEN,
  HELICAL_STD_GEN,
  MOTOR_CURRENT,
  WIRE_FACTOR,
} from "./lookups";
import { BOOSTER_LABEL, type PivotElectricInput, type PivotElectricResult, type SpanRow } from "./types";
import { eq, vlookupGen } from "./utils";

function motorAmps(hp: number | string, hz: 50 | 60) {
  const row = MOTOR_CURRENT.find((item) =>
    typeof hp === "string" ? eq(String(item.hp), hp) : Math.abs(Number(item.hp) - Number(hp)) < 1e-6,
  );
  if (!row) return 0;
  return hz === 50 ? row.hz50 : row.hz60;
}

function rpmForHp(hp: number | string) {
  if (hp === 0.6) return 34;
  if (hp === 1.2) return 68;
  if (hp === 1) return 30;
  if (hp === 1.5) return 56;
  return 0;
}

function ampacityLimit(gauge: number) {
  if (gauge === 8) return 45;
  if (gauge === 10) return 30;
  if (gauge === 12) return 20;
  if (gauge === 14) return 12;
  return Infinity;
}

function helicalRecKw(input: PivotElectricInput, driveUnits: number): number | null {
  if (input.motorType !== "helical") return null;
  const table = input.machineSpeed === "standard" ? HELICAL_STD_GEN : HELICAL_HIGH_GEN;
  const row = table[driveUnits];
  if (!row) return null;
  const idx = input.booster === "none" ? 0 : input.booster === "2hp" ? 1 : input.booster === "5hp" ? 2 : 3;
  return row[idx] ?? null;
}

export function computePivotElectric(input: PivotElectricInput): PivotElectricResult {
  const qty = input.spans.map((s) => Math.max(0, Math.floor(s.quantity)));
  const lengths = input.spans.map((s) => Math.max(0, s.lengthFt));
  const driveUnits = qty.reduce((a, b) => a + b, 0);
  const highMotors =
    input.machineSpeed === "standard"
      ? 0
      : driveUnits < 15
        ? Math.floor(driveUnits / 2 + 1)
        : Math.floor(driveUnits / 2 + 2);
  const stdMotors = Math.max(0, driveUnits - highMotors);
  const hasBp = input.booster !== "none";
  const totalRows = driveUnits + (hasBp ? 1 : 0);
  const lengthToLrdu = qty.reduce((sum, n, i) => sum + n * lengths[i], 0);
  const boosterLabel = BOOSTER_LABEL[input.booster];
  const stdHp = input.motorType === "helical" ? 0.6 : 1;
  const highHp = input.motorType === "helical" ? 1.2 : 1.5;
  const stdRpm = input.motorType === "helical" ? 34 : 30;
  const highRpm = input.motorType === "helical" ? 68 : 56;

  const spanMeta: { number: number; lengthFt: number; wireGauge: number; motorHp: number | string; rpm: number }[] =
    [];
  for (let n = 1; n <= totalRows; n++) {
    const isBp = hasBp && n > driveUnits;
    let lengthFt = 0;
    if (isBp) lengthFt = 1;
    else {
      let remaining = n;
      for (let i = 0; i < qty.length; i++) {
        if (remaining <= qty[i]) {
          lengthFt = lengths[i];
          break;
        }
        remaining -= qty[i];
      }
    }
    const eightTen = input.eightGaugeSpans + input.tenGaugeSpans;
    let wireGauge = 12;
    if (isBp) wireGauge = spanMeta[spanMeta.length - 1]?.wireGauge ?? 12;
    else if (n <= eightTen) wireGauge = n > input.eightGaugeSpans ? 10 : 8;
    else if (n > driveUnits - input.fourteenGaugeLastSpans) wireGauge = 14;
    const motorHp: number | string = isBp ? boosterLabel : input.machineSpeed === "standard" || n <= stdMotors ? stdHp : highHp;
    const rpm = isBp ? 0 : rpmForHp(motorHp as number) || (n <= stdMotors ? stdRpm : highRpm);
    spanMeta.push({ number: n, lengthFt, wireGauge, motorHp, rpm });
  }

  const maxRpm = Math.max(0, ...spanMeta.map((s) => s.rpm));
  const rows: SpanRow[] = spanMeta.map((meta, index) => {
    const duty =
      meta.rpm === 0 ? 1 : (spanMeta.slice(0, index + 1).reduce((s, r) => s + r.lengthFt, 0) / Math.max(lengthToLrdu, 1)) * (maxRpm / meta.rpm);
    const isLastDrive = !hasBp && meta.number === driveUnits;
    const isBp = typeof meta.motorHp === "string";
    const code = isBp || isLastDrive ? 1.25 : 1.2;
    const motorCurrent = motorAmps(meta.motorHp, input.frequencyHz);
    const wireFactor = WIRE_FACTOR[meta.wireGauge] ?? 0;
    return {
      number: meta.number,
      lengthFt: meta.lengthFt,
      wireGauge: meta.wireGauge,
      motorHp: meta.motorHp,
      rpm: meta.rpm,
      current: 0,
      voltage: 0,
      voltageDrop: 0,
      motorCurrent,
      boosterTrans: false,
      ampacityWarning: false,
      duty,
      code,
      wireFactor,
      currentNoBt: 0,
    };
  });

  for (let i = rows.length - 1; i >= 0; i--) {
    const nextNoBt = i === rows.length - 1 ? 0 : rows[i + 1].currentNoBt;
    rows[i].currentNoBt = rows[i].duty * rows[i].code * rows[i].motorCurrent + nextNoBt;
  }

  for (let i = 0; i < rows.length; i++) {
    const prevNoBt = i === 0 ? rows[0].currentNoBt : rows[i - 1].currentNoBt;
    if (input.boosterTransformer) {
      if (i === 0) rows[i].boosterTrans = rows[i].currentNoBt < 28.5;
      else rows[i].boosterTrans = rows[i].currentNoBt <= 28.5 && prevNoBt > 28.5;
    }
  }

  for (let i = rows.length - 1; i >= 0; i--) {
    const next = i === rows.length - 1 ? 0 : rows[i + 1].current;
    const base = rows[i].duty * rows[i].motorCurrent * rows[i].code + next;
    rows[i].current = rows[i].boosterTrans ? base * 1.05 : base;
    rows[i].voltageDrop = rows[i].current * rows[i].lengthFt * rows[i].wireFactor;
    rows[i].ampacityWarning = rows[i].current > ampacityLimit(rows[i].wireGauge);
  }

  for (let i = 0; i < rows.length; i++) {
    const prior = i === 0 ? input.pivotVoltage : rows[i - 1].voltage;
    const v = prior - rows[i].voltageDrop;
    rows[i].voltage = rows[i].boosterTrans ? v * 1.05 : v;
  }

  const systemCurrent = rows[0]?.current ?? 0;
  const lastTowerVoltage = rows[rows.length - 1]?.voltage ?? input.pivotVoltage;
  const voltageDrop = input.pivotVoltage - lastTowerVoltage;
  const powerKw = (Math.sqrt(3) * input.pivotVoltage * systemCurrent * 0.8) / 1000;
  const gen = vlookupGen(powerKw);
  const generatorHp = gen.efficiency ? powerKw / 0.746 / gen.efficiency : 0;
  const warnings: string[] = [];
  const g12 = rows.filter((r) => r.wireGauge === 12 && typeof r.motorHp !== "string").length;
  const g14 = rows.filter((r) => r.wireGauge === 14 && typeof r.motorHp !== "string").length;
  if (systemCurrent > 45) {
    warnings.push("System current exceeds 45 A — 45 amp panel required.");
  }
  if (input.frequencyHz === 60 && (input.pivotVoltage < 460 || input.pivotVoltage > 505)) {
    warnings.push("Supply should be 460–505 V at 60 Hz.");
  }
  if (input.frequencyHz === 50 && (input.pivotVoltage < 360 || input.pivotVoltage > 420)) {
    warnings.push("Supply should be 360–420 V at 50 Hz.");
  }
  if ((input.frequencyHz === 60 && lastTowerVoltage < 440) || (input.frequencyHz === 50 && lastTowerVoltage < 340)) {
    warnings.push("Last tower voltage is below the minimum (440 V at 60 Hz / 340 V at 50 Hz).");
  }
  const btMax = input.frequencyHz === 50 ? 380 : 480;
  if (rows.some((r) => r.boosterTrans && r.voltage > btMax)) {
    warnings.push(`Booster transformer voltage exceeds ${btMax} V.`);
  }
  if (g14 > 5) {
    warnings.push("More than five 14 ga spans — reduce 14 ga count.");
  }
  const max12 =
    input.booster === "none"
      ? input.machineSpeed === "standard"
        ? 12
        : 10
      : input.booster === "2hp"
        ? input.machineSpeed === "standard"
          ? 11
          : 9
        : input.booster === "5hp"
          ? input.machineSpeed === "standard"
            ? 8
            : 7
          : input.machineSpeed === "standard"
            ? 7
            : 6;
  if (g12 > max12) warnings.push(`Too many 12 ga spans (max ${max12} for this booster/speed).`);
  if (rows.some((r) => r.ampacityWarning)) warnings.push("One or more spans exceed wire ampacity.");

  const wireCounts = {
    g8: rows.filter((r) => r.wireGauge === 8 && typeof r.motorHp !== "string").length,
    g10: rows.filter((r) => r.wireGauge === 10 && typeof r.motorHp !== "string").length,
    g12: rows.filter((r) => r.wireGauge === 12 && typeof r.motorHp !== "string").length,
    g14: rows.filter((r) => r.wireGauge === 14 && typeof r.motorHp !== "string").length,
  };

  return {
    systemCurrent,
    voltageDrop,
    lastTowerVoltage,
    lengthToLrdu,
    powerKw,
    generatorHp,
    generatorKwMin: gen.sizeKw,
    generatorKwRec: helicalRecKw(input, driveUnits),
    stdMotors,
    highMotors,
    driveUnits,
    wireCounts,
    warnings,
    spans: rows,
    boosterLabel,
  };
}
