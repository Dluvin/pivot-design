import { GENERATOR_TABLE } from "./lookups";

export function num(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function round(value: number, digits = 2) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function eq(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function vlookupApprox<T>(table: [number, T][], lookup: number): T | undefined {
  let found: T | undefined;
  for (const [key, value] of table) {
    if (key <= lookup) found = value;
    else break;
  }
  return found;
}

export function vlookupGen(kw: number) {
  let row = GENERATOR_TABLE[0];
  for (const item of GENERATOR_TABLE) {
    if (item.minKw <= kw) row = item;
    else break;
  }
  return row;
}

/** Same inch steps as the Pivot/Linear Timer charts after ROUNDUP of the 100% depth. */
export function inchSteps(start: number) {
  const first = Math.ceil(start * 10 - 1e-9) / 10;
  const values: number[] = [first];
  while (values.length < 21) {
    const last = values[values.length - 1];
    const next = last < 1.5 ? last + 0.1 : last >= 2.5 ? last + 0.5 : last + 0.25;
    values.push(Math.round(next * 100) / 100);
  }
  return values;
}
