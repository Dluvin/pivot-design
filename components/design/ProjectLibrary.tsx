"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteProject,
  exportProjectJson,
  getActiveProjectId,
  importProjectJson,
  listProjects,
  newWorkspace,
  openProject,
  projectTitle,
  resizeImageFile,
  saveCurrentProject,
  setCompany,
  type SavedProject,
} from "@/lib/design/project";
import { useCompany } from "@/components/design/PrintBrand";

export function ProjectLibrary() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const company = useCompany();
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    setProjects(listProjects());
    setActiveId(getActiveProjectId());
  }, []);

  useEffect(() => {
    setBusinessName(company.businessName);
  }, [company.businessName]);

  function refresh() {
    setProjects(listProjects());
    setActiveId(getActiveProjectId());
  }

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className="no-print space-y-8">
      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-display text-xl">Saved projects</h2>
        <p className="mt-1 text-sm text-stone-600">
          Saves stay in this browser so you can open a job later. Export a JSON file if you need a backup or another
          computer.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white"
            onClick={() => {
              const saved = saveCurrentProject(activeId);
              refresh();
              flash(`Saved “${projectTitle(saved.snapshot.job)}”.`);
            }}
          >
            Save
          </button>
          <button
            type="button"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold"
            onClick={() => {
              const saved = saveCurrentProject(null);
              refresh();
              flash(`Saved new project “${projectTitle(saved.snapshot.job)}”.`);
            }}
          >
            Save as new
          </button>
          <button
            type="button"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold"
            onClick={() => {
              newWorkspace();
              refresh();
              flash("Started a new blank job.");
            }}
          >
            New job
          </button>
          <button
            type="button"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold"
            onClick={() => fileRef.current?.click()}
          >
            Import file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              file.text().then((text) => {
                try {
                  const saved = importProjectJson(text);
                  refresh();
                  flash(`Opened “${projectTitle(saved.snapshot.job)}”.`);
                } catch {
                  flash("That file is not a Pivot Design project.");
                }
              });
            }}
          />
        </div>
        {message ? <p className="mt-2 text-sm font-medium text-emerald-800">{message}</p> : null}
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
          {projects.length === 0 ? (
            <p className="px-3 py-4 text-sm text-stone-600">No saved projects yet. Fill in a job and click Save.</p>
          ) : (
            <ul className="divide-y divide-stone-100 text-sm">
              {projects.map((project) => (
                <li key={project.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <div>
                    <p className="font-medium">
                      {projectTitle(project.snapshot.job)}
                      {project.id === activeId ? (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                          Open
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-stone-500">
                      Saved {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-stone-300 px-2 py-1 text-xs font-semibold"
                      onClick={() => {
                        openProject(project.id);
                        refresh();
                        flash(`Opened “${projectTitle(project.snapshot.job)}”.`);
                      }}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-stone-300 px-2 py-1 text-xs font-semibold"
                      onClick={() => exportProjectJson(project)}
                    >
                      Export
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-800"
                      onClick={() => {
                        if (!confirm("Delete this saved project?")) return;
                        deleteProject(project.id);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-display text-xl">Company brand (print package)</h2>
        <p className="mt-1 text-sm text-stone-600">
          Logo and business name print at the top of every worksheet in the design package.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block text-sm">
            <span className="text-stone-600">Business name</span>
            <input
              className="mt-1 w-full rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5"
              value={businessName}
              onChange={(e) => {
                const next = e.target.value;
                setBusinessName(next);
                setCompany({ ...company, businessName: next });
              }}
            />
          </label>
          <button
            type="button"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold"
            onClick={() => logoRef.current?.click()}
          >
            {company.logoDataUrl ? "Change logo" : "Add logo"}
          </button>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              resizeImageFile(file)
                .then((logoDataUrl) => {
                  setCompany({ businessName, logoDataUrl });
                  flash("Logo saved.");
                })
                .catch(() => flash("Could not use that image."));
            }}
          />
        </div>
        {company.logoDataUrl ? (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.logoDataUrl} alt="" className="h-16 max-w-48 object-contain" />
            <button
              type="button"
              className="text-sm font-semibold text-red-800"
              onClick={() => {
                setCompany({ businessName, logoDataUrl: "" });
              }}
            >
              Remove logo
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
