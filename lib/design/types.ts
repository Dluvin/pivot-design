export type Booster = "none" | "2hp" | "5hp" | "7.5hp";
export type MachineSpeed = "standard" | "high";
export type MotorType = "helical" | "standard";

export type SpanGroup = { quantity: number; lengthFt: number };

export type PivotElectricInput = {
  pivotVoltage: number;
  frequencyHz: 50 | 60;
  booster: Booster;
  machineSpeed: MachineSpeed;
  motorType: MotorType;
  boosterTransformer: boolean;
  spans: SpanGroup[];
  eightGaugeSpans: number;
  tenGaugeSpans: number;
  fourteenGaugeLastSpans: number;
};

export type SpanRow = {
  number: number;
  lengthFt: number;
  wireGauge: number;
  motorHp: number | string;
  rpm: number;
  current: number;
  voltage: number;
  voltageDrop: number;
  motorCurrent: number;
  boosterTrans: boolean;
  ampacityWarning: boolean;
  duty: number;
  code: number;
  wireFactor: number;
  currentNoBt: number;
};

export type PivotElectricResult = {
  systemCurrent: number;
  voltageDrop: number;
  lastTowerVoltage: number;
  lengthToLrdu: number;
  powerKw: number;
  generatorHp: number;
  generatorKwMin: number;
  generatorKwRec: number | null;
  stdMotors: number;
  highMotors: number;
  driveUnits: number;
  wireCounts: { g8: number; g10: number; g12: number; g14: number };
  warnings: string[];
  spans: SpanRow[];
  boosterLabel: string;
};

export const BOOSTER_LABEL: Record<Booster, string> = {
  none: "No BP",
  "2hp": "2 HP BP",
  "5hp": "5 HP BP",
  "7.5hp": "7 1/2 HP BP",
};

export const DEFAULT_ELECTRIC: PivotElectricInput = {
  pivotVoltage: 480,
  frequencyHz: 60,
  booster: "none",
  machineSpeed: "standard",
  motorType: "helical",
  boosterTransformer: false,
  spans: [
    { quantity: 7, lengthFt: 180 },
    { quantity: 0, lengthFt: 160 },
    { quantity: 0, lengthFt: 205 },
    { quantity: 0, lengthFt: 0 },
    { quantity: 0, lengthFt: 0 },
    { quantity: 0, lengthFt: 0 },
  ],
  eightGaugeSpans: 0,
  tenGaugeSpans: 7,
  fourteenGaugeLastSpans: 1,
};
