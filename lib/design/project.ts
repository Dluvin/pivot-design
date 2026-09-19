import {
  ELECTRIC_KEY,
  END_GUN_KEY,
  GPM_IAR_KEY,
  JOB_KEY,
  LINEAR_TIMER_KEY,
  MAINLINE_ELEC_KEY,
  MAINLINE_PSI_KEY,
  PRESSURE_KEY,
  PIVOT_TIMER_KEY,
  SUMMARY_KEY,
  type DesignJob,
} from "./job";
import { EMPTY_SNAPSHOT, type ProjectSnapshot } from "./defaults";

export const PROJECTS_KEY = "ag-design-projects";
export const ACTIVE_PROJECT_KEY = "ag-design-active-project";
export const COMPANY_KEY = "ag-design-company";
export const RELOAD_EVENT = "ag-design-reload";
export const COMPANY_EVENT = "ag-design-company";

export type CompanyProfile = {
  businessName: string;
  logoDataUrl: string;
};

export const DEFAULT_COMPANY: CompanyProfile = {
  businessName: "American Irrigation",
  logoDataUrl: "",
};

export type SavedProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  snapshot: ProjectSnapshot;
};

export function projectTitle(job: DesignJob) {
  const name = job.name.trim() || "Untitled";
  const field = job.fieldName.trim();
  return field ? `${name} — ${field}` : name;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function listProjects(): SavedProject[] {
  const list = readJson<SavedProject[]>(PROJECTS_KEY, []);
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getActiveProjectId() {
  return readJson<string | null>(ACTIVE_PROJECT_KEY, null);
}

export function setActiveProjectId(id: string | null) {
  if (id) writeJson(ACTIVE_PROJECT_KEY, id);
  else localStorage.removeItem(ACTIVE_PROJECT_KEY);
}

export function getCompany(): CompanyProfile {
  const stored = readJson<Partial<CompanyProfile>>(COMPANY_KEY, {});
  return { ...DEFAULT_COMPANY, ...stored };
}

export function setCompany(company: CompanyProfile) {
  writeJson(COMPANY_KEY, company);
  window.dispatchEvent(new Event(COMPANY_EVENT));
}

export function readWorkspace(): ProjectSnapshot {
  return {
    job: { ...EMPTY_SNAPSHOT.job, ...readJson(JOB_KEY, EMPTY_SNAPSHOT.job) },
    electric: { ...EMPTY_SNAPSHOT.electric, ...readJson(ELECTRIC_KEY, EMPTY_SNAPSHOT.electric) },
    pressure: { ...EMPTY_SNAPSHOT.pressure, ...readJson(PRESSURE_KEY, EMPTY_SNAPSHOT.pressure) },
    mainlineElec: { ...EMPTY_SNAPSHOT.mainlineElec, ...readJson(MAINLINE_ELEC_KEY, EMPTY_SNAPSHOT.mainlineElec) },
    mainlinePsi: { ...EMPTY_SNAPSHOT.mainlinePsi, ...readJson(MAINLINE_PSI_KEY, EMPTY_SNAPSHOT.mainlinePsi) },
    pivotTimer: { ...EMPTY_SNAPSHOT.pivotTimer, ...readJson(PIVOT_TIMER_KEY, EMPTY_SNAPSHOT.pivotTimer) },
    linearTimer: { ...EMPTY_SNAPSHOT.linearTimer, ...readJson(LINEAR_TIMER_KEY, EMPTY_SNAPSHOT.linearTimer) },
    endGun: { ...EMPTY_SNAPSHOT.endGun, ...readJson(END_GUN_KEY, EMPTY_SNAPSHOT.endGun) },
    gpmIar: { ...EMPTY_SNAPSHOT.gpmIar, ...readJson(GPM_IAR_KEY, EMPTY_SNAPSHOT.gpmIar) },
    summary: { ...EMPTY_SNAPSHOT.summary, ...readJson(SUMMARY_KEY, EMPTY_SNAPSHOT.summary) },
  };
}

export function writeWorkspace(snapshot: ProjectSnapshot) {
  writeJson(JOB_KEY, snapshot.job);
  writeJson(ELECTRIC_KEY, snapshot.electric);
  writeJson(PRESSURE_KEY, snapshot.pressure);
  writeJson(MAINLINE_ELEC_KEY, snapshot.mainlineElec);
  writeJson(MAINLINE_PSI_KEY, snapshot.mainlinePsi);
  writeJson(PIVOT_TIMER_KEY, snapshot.pivotTimer);
  writeJson(LINEAR_TIMER_KEY, snapshot.linearTimer);
  writeJson(END_GUN_KEY, snapshot.endGun);
  writeJson(GPM_IAR_KEY, snapshot.gpmIar);
  writeJson(SUMMARY_KEY, snapshot.summary);
  window.dispatchEvent(new Event(RELOAD_EVENT));
}

export function notifyReload() {
  window.dispatchEvent(new Event(RELOAD_EVENT));
}

export function saveCurrentProject(existingId?: string | null) {
  const snapshot = readWorkspace();
  const now = new Date().toISOString();
  const projects = listProjects();
  const id = existingId || crypto.randomUUID();
  const previous = projects.find((p) => p.id === id);
  const saved: SavedProject = {
    id,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    snapshot,
  };
  writeJson(PROJECTS_KEY, [...projects.filter((p) => p.id !== id), saved]);
  setActiveProjectId(id);
  return saved;
}

export function openProject(id: string) {
  const project = listProjects().find((p) => p.id === id);
  if (!project) return null;
  writeWorkspace(project.snapshot);
  setActiveProjectId(id);
  return project;
}

export function deleteProject(id: string) {
  writeJson(
    PROJECTS_KEY,
    listProjects().filter((p) => p.id !== id),
  );
  if (getActiveProjectId() === id) setActiveProjectId(null);
}

export function newWorkspace() {
  writeWorkspace({
    ...EMPTY_SNAPSHOT,
    job: {
      ...EMPTY_SNAPSHOT.job,
      name: "",
      fieldName: "",
      address: "",
      phone: "",
      salesperson: "",
      comments: "",
    },
  });
  setActiveProjectId(null);
}

export function exportProjectJson(project: SavedProject) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectTitle(project.snapshot.job).replace(/[^\w\- ]+/g, "")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProjectJson(text: string) {
  const parsed = JSON.parse(text) as SavedProject;
  if (!parsed?.snapshot?.job) throw new Error("Not a Pivot Design project file.");
  const now = new Date().toISOString();
  const saved: SavedProject = {
    id: crypto.randomUUID(),
    createdAt: parsed.createdAt ?? now,
    updatedAt: now,
    snapshot: {
      ...EMPTY_SNAPSHOT,
      ...parsed.snapshot,
      job: { ...EMPTY_SNAPSHOT.job, ...parsed.snapshot.job },
      endGun: { ...EMPTY_SNAPSHOT.endGun, ...parsed.snapshot.endGun },
      gpmIar: { ...EMPTY_SNAPSHOT.gpmIar, ...parsed.snapshot.gpmIar },
      summary: { ...EMPTY_SNAPSHOT.summary, ...parsed.snapshot.summary },
    },
  };
  writeJson(PROJECTS_KEY, [...listProjects(), saved]);
  openProject(saved.id);
  return saved;
}

export function resizeImageFile(file: File, maxSize = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not draw image."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
