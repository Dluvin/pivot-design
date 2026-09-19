export type GpmIarInput = {
  machineGpm: number;
  lengthToEgFt: number;
  endGunRadiusFt: number;
  wettedDiameterFt: number;
  spacingFt: number;
  outletMode: boolean;
  outletDistanceFt: number;
};

export function computeGpmIar(input: GpmIarInput) {
  const r = input.lengthToEgFt + input.endGunRadiusFt;
  const dist = input.outletMode ? input.outletDistanceFt : input.lengthToEgFt;
  const sprinklerGpm =
    r <= 0
      ? 0
      : input.outletMode
        ? (input.machineGpm * 2 * dist * input.spacingFt) / r ** 2
        : (input.machineGpm * input.spacingFt) / r;
  const iarInHr =
    r <= 0 || input.wettedDiameterFt <= 0
      ? 0
      : input.outletMode
        ? (((dist + 1) ** 2 - dist ** 2) / r ** 2) * input.machineGpm * (96.25 / input.wettedDiameterFt)
        : (input.machineGpm * 96.25) / (r * input.wettedDiameterFt);
  return {
    sprinklerGpm,
    sprinklerLps: sprinklerGpm * (3.785 / 60),
    iarInHr,
    iarMmHr: iarInHr * 25.4,
    radiusFt: r,
  };
}

export const DEFAULT_GPM_IAR: Pick<GpmIarInput, "wettedDiameterFt" | "spacingFt" | "outletMode"> = {
  wettedDiameterFt: 30,
  spacingFt: 9,
  outletMode: true,
};
