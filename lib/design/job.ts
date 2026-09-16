export type DesignJob = {
  customerLabel: string;
  name: string;
  address: string;
  phone: string;
  fieldName: string;
  salesperson: string;
  dealership: string;
  comments: string;
};

export const DEFAULT_JOB: DesignJob = {
  customerLabel: "Customer",
  name: "Reid Bros.",
  address: "",
  phone: "",
  fieldName: "",
  salesperson: "",
  dealership: "American Irrigation",
  comments: "",
};

export const JOB_KEY = "ag-design-job";
export const ELECTRIC_KEY = "ag-design-electric";
export const PRESSURE_KEY = "ag-design-pressure";
export const MAINLINE_ELEC_KEY = "ag-design-mainline-elec";
export const MAINLINE_PSI_KEY = "ag-design-mainline-psi";
export const PIVOT_TIMER_KEY = "ag-design-pivot-timer";
export const LINEAR_TIMER_KEY = "ag-design-linear-timer";
