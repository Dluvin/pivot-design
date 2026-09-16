"use client";

import Link from "next/link";
import { DESIGN_TOOLS } from "@/lib/design/tools";

export function DesignChrome({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="no-print rounded-xl border border-stone-200 bg-white p-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Pivot design</p>
        <nav className="flex flex-col gap-0.5 text-sm">
          {DESIGN_TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className={`rounded-md px-2 py-1.5 ${
                active === tool.id ? "bg-emerald-800 text-white" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {tool.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-stone-600">{subtitle}</p> : null}
          </div>
          <div className="no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function YellowHint() {
  return (
    <p className="text-sm text-stone-600">
      Yellow fields are inputs — everything else calculates live, same as the original workbook.
    </p>
  );
}

export function fmt(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function JobLine({
  name,
  fieldName,
  salesperson,
  dealership,
}: {
  name: string;
  fieldName: string;
  salesperson: string;
  dealership: string;
}) {
  return (
    <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
      <span className="font-medium">{name || "Unnamed job"}</span>
      {fieldName ? ` · ${fieldName}` : ""}
      {salesperson ? ` · ${salesperson}` : ""}
      {dealership ? ` · ${dealership}` : ""}
      <span className="text-stone-500"> · {new Date().toLocaleDateString()}</span>
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-stone-600">{label}</span>
      <input
        type={type}
        step={step}
        className="mt-1 w-full rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-stone-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-sm">
      <span className="text-stone-600">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-stone-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Result({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-lg border bg-white p-3 ${warn ? "border-red-400" : "border-stone-200"}`}>
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${warn ? "text-red-700" : ""}`}>{value}</p>
    </div>
  );
}
