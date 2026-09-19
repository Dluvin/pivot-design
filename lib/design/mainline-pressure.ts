import { HW_C, IPS_PIPE, PIP_PIPE } from "./lookups";

export type MainlinePressureInput = {
  gpm: number;
  lengthFt: number;
  cIndex: 1 | 2 | 3 | 4 | 5;
  pipeKind: "pip" | "ips" | "custom";
  nomSize: number;
  psiRating: number;
  customOd: number;
  customWall: number;
};

export function computeMainlinePressure(input: MainlinePressureInput) {
  const c = HW_C[input.cIndex] ?? 150;
  let nom = input.nomSize;
  let rating = input.psiRating;
  let id = 0;
  if (input.pipeKind === "custom") {
    nom = input.customOd;
    rating = input.customWall;
    id = input.customOd - 2 * input.customWall;
  } else if (input.pipeKind === "pip") {
    const row = PIP_PIPE[input.nomSize];
    const wall = row?.wall[input.psiRating];
    id = row && wall != null ? row.od - 2 * wall : 0;
  } else {
    const row = IPS_PIPE[input.nomSize];
    const wall = row?.wall[input.psiRating];
    id = row && wall != null ? row.od - 2 * wall : 0;
  }
  const headFt = id > 0 ? (10.46 * input.lengthFt * (input.gpm / c) ** 1.85) / id ** 4.8655 : 0;
  const psi = headFt / 2.31;
  const velocity = id > 0 ? (0.408 * input.gpm) / id ** 2 : 0;
  const velocityMps = velocity * 0.3048;
  const bar = psi * 0.06895;
  return { c, nom, rating, id, headFt, psi, bar, velocity, velocityMps };
}
