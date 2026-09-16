/** Tables copied from Pivot Design.xls (Valley Pivot Design 1.0, Oct 2001). */

export const MOTOR_CURRENT: { hp: number | string; hz60: number; hz50: number }[] = [
  { hp: 0, hz60: 0, hz50: 0 },
  { hp: 0.6, hz60: 1.1, hz50: 1.1 },
  { hp: 0.75, hz60: 1.5, hz50: 1.5 },
  { hp: 1, hz60: 1.9, hz50: 1.9 },
  { hp: 1.2, hz60: 1.8, hz50: 1.8 },
  { hp: 1.5, hz60: 2.55, hz50: 2.55 },
  { hp: "2 HP BP", hz60: 4, hz50: 4 },
  { hp: "5 HP BP", hz60: 7.3, hz50: 7.3 },
  { hp: "7 1/2 HP BP", hz60: 9.3, hz50: 9.3 },
];

export const WIRE_FACTOR: Record<number, number> = {
  8: 0.000876,
  10: 0.001312,
  12: 0.002149,
  13: 0.002645,
  14: 0.003295,
};

export const GENERATOR_TABLE: { minKw: number; sizeKw: number; efficiency: number; frame: number }[] = [
  { minKw: 0, sizeKw: 5, efficiency: 0.799, frame: 280 },
  { minKw: 5.001, sizeKw: 7.5, efficiency: 0.821, frame: 280 },
  { minKw: 7.501, sizeKw: 10, efficiency: 0.845, frame: 280 },
  { minKw: 10.001, sizeKw: 12, efficiency: 0.848, frame: 280 },
  { minKw: 12.001, sizeKw: 15, efficiency: 0.861, frame: 280 },
  { minKw: 15.001, sizeKw: 20, efficiency: 0.865, frame: 360 },
  { minKw: 20.001, sizeKw: 25, efficiency: 0.877, frame: 360 },
  { minKw: 25.001, sizeKw: 30, efficiency: 0.891, frame: 360 },
  { minKw: 30.001, sizeKw: 40, efficiency: 0.895, frame: 360 },
  { minKw: 40.001, sizeKw: 50, efficiency: 0.9, frame: 440 },
  { minKw: 50.001, sizeKw: 60, efficiency: 0.903, frame: 440 },
  { minKw: 60.001, sizeKw: 75, efficiency: 0.906, frame: 440 },
  { minKw: 75.001, sizeKw: 100, efficiency: 0.907, frame: 440 },
  { minKw: 100.001, sizeKw: 125, efficiency: 0.915, frame: 580 },
  { minKw: 125.001, sizeKw: 150, efficiency: 0.921, frame: 580 },
  { minKw: 150.001, sizeKw: 175, efficiency: 0.926, frame: 580 },
  { minKw: 175.001, sizeKw: 200, efficiency: 0.931, frame: 580 },
  { minKw: 200.001, sizeKw: 250, efficiency: 0.936, frame: 680 },
];

/** Recommended generator kW by drive-unit count: [none, 2hp, 5hp, 7.5hp] */
export const HELICAL_STD_GEN: Record<number, [number, number, number, number]> = {
  2: [5, 5, 10, 10],
  3: [5, 7.5, 10, 10],
  4: [5, 7.5, 10, 12],
  5: [5, 7.5, 10, 12],
  6: [5, 7.5, 12, 12],
  7: [7.5, 10, 12, 15],
  8: [7.5, 10, 12, 15],
  9: [7.5, 10, 12, 15],
  10: [7.5, 12, 15, 15],
  11: [10, 12, 15, 20],
  12: [10, 12, 15, 20],
  13: [10, 15, 15, 20],
  14: [12, 15, 20, 20],
  15: [12, 15, 20, 20],
  16: [12, 15, 20, 20],
  17: [15, 20, 20, 20],
  18: [15, 20, 20, 25],
  19: [15, 20, 20, 25],
  20: [15, 20, 20, 25],
  21: [20, 20, 25, 25],
  22: [20, 20, 25, 25],
  23: [20, 25, 25, 25],
  24: [20, 25, 25, 30],
  25: [20, 25, 30, 30],
};

export const HELICAL_HIGH_GEN: Record<number, [number?, number?, number?, number?]> = {
  2: [5, 7.5, 7.5, 10],
  3: [5, 7.5, 7.5, 12],
  4: [7.5, 7.5, 7.5, 12],
  5: [7.5, 10, 10, 15],
  6: [7.5, 10, 10, 15],
  7: [7.5, 12, 12, 15],
  8: [10, 12, 15, 20],
  9: [10, 15, 15, 20],
  10: [12, 15, 15, 20],
  11: [12, 15, 20, 20],
  12: [15, 20, 20, 20],
  13: [15, 20, 20, 25],
  14: [15, 20, 20, 25],
  15: [20, 20, 25, 25],
  16: [20, 25, 25, 25],
  17: [20, 25, 25, 30],
  18: [20, 25, 25, 30],
  19: [25, 25, 25],
  20: [25, 25],
  21: [25, 30],
  22: [25, 30],
  23: [25],
  24: [30],
  25: [30],
};

export const FRICTION_PERCENT = [
  0.03, 0.05, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.17, 0.19, 0.21, 0.23, 0.24, 0.26, 0.28, 0.29, 0.31,
  0.33, 0.34, 0.36, 0.37, 0.39, 0.4, 0.42, 0.43, 0.45, 0.46, 0.48, 0.49, 0.51, 0.52, 0.54, 0.55, 0.56,
  0.58, 0.59, 0.6, 0.62, 0.63, 0.64, 0.65, 0.66, 0.68, 0.69, 0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76,
  0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.86, 0.87, 0.88, 0.89, 0.89, 0.9, 0.91,
  0.91, 0.92, 0.93, 0.93, 0.94, 0.94, 0.95, 0.95, 0.96, 0.96, 0.97, 0.97, 0.98, 0.98, 0.98, 0.99, 0.99,
  0.99, 0.99, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

export const PIPE_DIAMETERS = [
  { id: "10", label: '10"', factor: 0.13 },
  { id: "8-5/8", label: '8 5/8"', factor: 0.267 },
  { id: "8-5/8-poly", label: '8 5/8" POLY', factor: 0.325 },
  { id: "8", label: '8"', factor: 0.39 },
  { id: "6-5/8", label: '6 5/8"', factor: 1 },
  { id: "6-5/8-poly", label: '6 5/8" POLY', factor: 1.293 },
  { id: "6", label: '6"', factor: 1.65 },
  { id: "5-9/16", label: '5 9/16"', factor: 2.55 },
  { id: "5", label: '5"', factor: 4.4 },
  { id: "4", label: '4"', factor: 13.97 },
] as const;

export const PIP_PIPE: Record<number, { od: number; wall: Record<number, number | null> }> = {
  4: { od: 4.13, wall: { 50: null, 80: null, 100: 0.101, 125: 0.127 } },
  6: { od: 6.14, wall: { 50: 0.076, 80: 0.12, 100: 0.15, 125: 0.189 } },
  8: { od: 8.16, wall: { 50: 0.101, 80: 0.16, 100: 0.199, 125: 0.251 } },
  10: { od: 10.2, wall: { 50: 0.126, 80: 0.2, 100: 0.249, 125: 0.314 } },
  12: { od: 12.24, wall: { 50: 0.151, 80: 0.24, 100: 0.299, 125: 0.377 } },
  14: { od: 14.28, wall: { 50: null, 80: 0.28, 100: 0.348, 125: 0.439 } },
  15: { od: 15.3, wall: { 50: null, 80: 0.3, 100: 0.373, 125: 0.471 } },
  18: { od: 18.7, wall: { 50: null, 80: 0.367, 100: 0.456, 125: 0.575 } },
};

export const IPS_PIPE: Record<number, { od: number; wall: Record<number, number> }> = {
  4: { od: 4.5, wall: { 100: 0.11, 125: 0.138, 160: 0.173, 200: 0.214 } },
  5: { od: 5.563, wall: { 100: 0.136, 125: 0.171, 160: 0.214, 200: 0.265 } },
  6: { od: 6.625, wall: { 100: 0.162, 125: 0.204, 160: 0.255, 200: 0.316 } },
  8: { od: 8.625, wall: { 100: 0.21, 125: 0.265, 160: 0.332, 200: 0.41 } },
  10: { od: 10.75, wall: { 100: 0.262, 125: 0.331, 160: 0.413, 200: 0.551 } },
  12: { od: 12.75, wall: { 100: 0.311, 125: 0.392, 160: 0.49, 200: 0.606 } },
};

export const HW_C: Record<number, number> = { 1: 150, 2: 140, 3: 130, 4: 120, 5: 100 };

export const TIMER_RPM: Record<number, number> = {
  1: 29,
  2: 30,
  3: 35,
  4: 37,
  5: 43,
  6: 56,
  7: 58,
  8: 68,
  9: 84,
  10: 86,
  11: 100,
  13: 34,
};

export const TIRES = [
  { id: 1, label: "10R x 22.5", circumference: 123 },
  { id: 2, label: "11.2 x 24", circumference: 127 },
  { id: 3, label: "11 x 24.5 RET", circumference: 131.76 },
  { id: 4, label: "14.9 x 24", circumference: 140.75 },
  { id: 5, label: "16.9 x 24", circumference: 150.11 },
  { id: 6, label: "11.2 x 38", circumference: 173.43 },
  { id: 7, label: "Measured", circumference: 0 },
] as const;

export type CopperSize =
  | "14"
  | "12"
  | "10"
  | "8"
  | "6"
  | "4"
  | "3"
  | "2"
  | "1"
  | "0"
  | "00"
  | "000"
  | "0000"
  | "250m"
  | "300m"
  | "350m"
  | "400m"
  | "500m"
  | "600m"
  | "750m"
  | "1000m";

export type AlumSize =
  | "12"
  | "10"
  | "8"
  | "6"
  | "4"
  | "2"
  | "1"
  | "0"
  | "00"
  | "000"
  | "0000"
  | "250m"
  | "300m"
  | "350m"
  | "400m"
  | "500m"
  | "600m"
  | "750m"
  | "1000m";

export const COPPER_WIRE: { size: CopperSize; pf80: number; pf60: number; ampacity: number }[] = [
  { size: "1", pf80: 251, pf60: 213, ampacity: 130 },
  { size: "2", pf80: 306, pf60: 254, ampacity: 115 },
  { size: "3", pf80: 375, pf60: 308, ampacity: 100 },
  { size: "4", pf80: 474, pf60: 381, ampacity: 85 },
  { size: "6", pf80: 727, pf60: 573, ampacity: 65 },
  { size: "8", pf80: 1130, pf60: 876, ampacity: 50 },
  { size: "10", pf80: 1712, pf60: 1312, ampacity: 35 },
  { size: "12", pf80: 2829, pf60: 2149, ampacity: 25 },
  { size: "14", pf80: 4366, pf60: 3295, ampacity: 20 },
  { size: "0", pf80: 207, pf60: 180, ampacity: 150 },
  { size: "00", pf80: 174, pf60: 154, ampacity: 175 },
  { size: "000", pf80: 145, pf60: 133, ampacity: 200 },
  { size: "0000", pf80: 124, pf60: 116, ampacity: 230 },
  { size: "250m", pf80: 110, pf60: 107, ampacity: 285 },
  { size: "300m", pf80: 98, pf60: 96, ampacity: 310 },
  { size: "350m", pf80: 91, pf60: 90, ampacity: 335 },
  { size: "400m", pf80: 83, pf60: 84, ampacity: 380 },
  { size: "500m", pf80: 74, pf60: 77, ampacity: 420 },
  { size: "600m", pf80: 69, pf60: 74, ampacity: 475 },
  { size: "750m", pf80: 62, pf60: 67, ampacity: 545 },
  { size: "1000m", pf80: 57, pf60: 64, ampacity: 255 },
];

export const ALUM_WIRE: { size: AlumSize; pf80: number; pf60: number; ampacity: number }[] = [
  { size: "1", pf80: 389, pf60: 316, ampacity: 100 },
  { size: "2", pf80: 486, pf60: 389, ampacity: 90 },
  { size: "4", pf80: 751, pf60: 588, ampacity: 65 },
  { size: "6", pf80: 1169, pf60: 905, ampacity: 50 },
  { size: "8", pf80: 1848, pf60: 1416, ampacity: 40 },
  { size: "10", pf80: 2819, pf60: 2144, ampacity: 30 },
  { size: "12", pf80: 4487, pf60: 3396, ampacity: 20 },
  { size: "0", pf80: 318, pf60: 263, ampacity: 120 },
  { size: "00", pf80: 261, pf60: 218, ampacity: 135 },
  { size: "000", pf80: 219, pf60: 187, ampacity: 155 },
  { size: "0000", pf80: 178, pf60: 155, ampacity: 180 },
  { size: "250m", pf80: 157, pf60: 140, ampacity: 230 },
  { size: "300m", pf80: 136, pf60: 124, ampacity: 250 },
  { size: "350m", pf80: 122, pf60: 114, ampacity: 270 },
  { size: "400m", pf80: 93, pf60: 105, ampacity: 310 },
  { size: "500m", pf80: 96, pf60: 95, ampacity: 340 },
  { size: "600m", pf80: 86, pf60: 86, ampacity: 385 },
  { size: "750m", pf80: 76, pf60: 77, ampacity: 445 },
  { size: "1000m", pf80: 65, pf60: 69, ampacity: 205 },
];

export const COPPER_SIZE_BY_TABLE_80: [number, CopperSize][] = [
  [57, "1000m"],
  [62, "750m"],
  [69, "600m"],
  [74, "500m"],
  [83, "400m"],
  [91, "350m"],
  [98, "300m"],
  [110, "250m"],
  [124, "0000"],
  [145, "000"],
  [174, "00"],
  [207, "0"],
  [251, "1"],
  [306, "2"],
  [375, "3"],
  [474, "4"],
  [727, "6"],
  [1130, "8"],
  [1712, "10"],
  [2829, "12"],
  [4366, "14"],
];

export const COPPER_SIZE_BY_TABLE_60: [number, CopperSize][] = [
  [64, "1000m"],
  [67, "750m"],
  [74, "600m"],
  [77, "500m"],
  [84, "400m"],
  [90, "350m"],
  [96, "300m"],
  [107, "250m"],
  [116, "0000"],
  [133, "000"],
  [154, "00"],
  [180, "0"],
  [213, "1"],
  [254, "2"],
  [308, "3"],
  [381, "4"],
  [573, "6"],
  [876, "8"],
  [1312, "10"],
  [2149, "12"],
  [3295, "14"],
];

export const ALUM_SIZE_BY_TABLE_80: [number, AlumSize][] = [
  [65, "1000m"],
  [76, "750m"],
  [86, "600m"],
  [93, "400m"],
  [96, "500m"],
  [122, "350m"],
  [136, "300m"],
  [157, "250m"],
  [178, "0000"],
  [219, "000"],
  [261, "00"],
  [318, "0"],
  [389, "1"],
  [486, "2"],
  [751, "4"],
  [1169, "6"],
  [1848, "8"],
  [2819, "10"],
  [4487, "12"],
];

export const ALUM_SIZE_BY_TABLE_60: [number, AlumSize][] = [
  [69, "1000m"],
  [77, "750m"],
  [86, "600m"],
  [95, "500m"],
  [105, "400m"],
  [114, "350m"],
  [124, "300m"],
  [140, "250m"],
  [155, "0000"],
  [187, "000"],
  [218, "00"],
  [263, "0"],
  [316, "1"],
  [389, "2"],
  [588, "4"],
  [905, "6"],
  [1416, "8"],
  [2144, "10"],
  [3396, "12"],
];
