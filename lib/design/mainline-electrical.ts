import {
  ALUM_SIZE_BY_TABLE_60,
  ALUM_SIZE_BY_TABLE_80,
  ALUM_WIRE,
  COPPER_SIZE_BY_TABLE_60,
  COPPER_SIZE_BY_TABLE_80,
  COPPER_WIRE,
  type AlumSize,
  type CopperSize,
} from "./lookups";
import { vlookupApprox } from "./utils";

export type MainlineElectricalInput = {
  powerFactor: 0.6 | 0.8;
  wireLengthFt: number;
  pivotAmps: number;
  additionalAmps: number;
  sourceVoltage: number;
  dropMode: "5pct" | "3pct" | "10v";
  desiredCopper: CopperSize | "";
  desiredAluminum: AlumSize | "";
  spanVoltageDrop: number;
};

export function computeMainlineElectrical(input: MainlineElectricalInput) {
  const totalAmps = input.pivotAmps + input.additionalAmps;
  const allow =
    input.dropMode === "3pct" ? input.sourceVoltage * 0.03 : input.dropMode === "10v" ? 10 : input.sourceVoltage * 0.05;
  const tableNumber = totalAmps > 0 && input.wireLengthFt > 0 ? (allow * 1_000_000) / (input.wireLengthFt * totalAmps) : 0;
  const pf60 = input.powerFactor === 0.6;
  const reqCu = vlookupApprox(pf60 ? COPPER_SIZE_BY_TABLE_60 : COPPER_SIZE_BY_TABLE_80, tableNumber);
  const reqAl = vlookupApprox(pf60 ? ALUM_SIZE_BY_TABLE_60 : ALUM_SIZE_BY_TABLE_80, tableNumber);

  function copper(size: CopperSize | undefined) {
    if (!size) return null;
    const row = COPPER_WIRE.find((w) => w.size === size);
    if (!row) return null;
    const table = pf60 ? row.pf60 : row.pf80;
    const drop = (input.wireLengthFt * totalAmps * table) / 1_000_000;
    return { size, ampacity: row.ampacity, table, drop, pivotVoltage: input.sourceVoltage - drop, endVoltage: input.sourceVoltage - drop - input.spanVoltageDrop };
  }
  function alum(size: AlumSize | undefined) {
    if (!size) return null;
    const row = ALUM_WIRE.find((w) => w.size === size);
    if (!row) return null;
    const table = pf60 ? row.pf60 : row.pf80;
    const drop = (input.wireLengthFt * totalAmps * table) / 1_000_000;
    return { size, ampacity: row.ampacity, table, drop, pivotVoltage: input.sourceVoltage - drop, endVoltage: input.sourceVoltage - drop - input.spanVoltageDrop };
  }

  const required = { copper: copper(reqCu), aluminum: alum(reqAl) };
  const desired = {
    copper: copper(input.desiredCopper || undefined),
    aluminum: alum(input.desiredAluminum || undefined),
  };
  const ampWarn = [required.copper, required.aluminum, desired.copper, desired.aluminum].some(
    (row) => row && row.ampacity < totalAmps,
  );
  const minEnd = input.sourceVoltage >= 400 ? 440 : 340;
  const endWarn = [required.copper, required.aluminum, desired.copper, desired.aluminum].some(
    (row) => row && row.endVoltage < minEnd,
  );
  const warnings: string[] = [];
  if (ampWarn) warnings.push("Confirm total amp draw does not exceed wire ampacity.");
  if (endWarn) {
    warnings.push(
      `Last-tower (pivot end) voltage is below ${minEnd} V. Increase feeder size or raise source voltage.`,
    );
  }

  return { totalAmps, allow, tableNumber, required, desired, ampWarn, endWarn, minEnd, warnings };
}
