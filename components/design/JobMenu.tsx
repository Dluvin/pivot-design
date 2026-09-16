"use client";

import { DEFAULT_JOB, JOB_KEY, type DesignJob } from "@/lib/design/job";
import { DESIGN_TOOLS } from "@/lib/design/tools";
import { DesignChrome, Input, YellowHint } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";
import Link from "next/link";

export function JobMenu() {
  const [job, setJob] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  function patch(partial: Partial<DesignJob>) {
    setJob({ ...job, ...partial });
  }

  return (
    <DesignChrome title="Pivot design" subtitle="Menu-driven calculators from the Pivot Design workbook." active="job">
      <YellowHint />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Name" value={job.name} onChange={(name) => patch({ name })} />
        <Input label="Field name" value={job.fieldName} onChange={(fieldName) => patch({ fieldName })} />
        <Input label="Address" value={job.address} onChange={(address) => patch({ address })} />
        <Input label="Phone" value={job.phone} onChange={(phone) => patch({ phone })} />
        <Input label="Salesperson" value={job.salesperson} onChange={(salesperson) => patch({ salesperson })} />
        <Input label="Dealership" value={job.dealership} onChange={(dealership) => patch({ dealership })} />
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-stone-600">Comments</span>
        <textarea
          className="mt-1 w-full rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5"
          rows={3}
          value={job.comments}
          onChange={(e) => patch({ comments: e.target.value })}
        />
      </label>
      <p className="mt-6 text-xs text-stone-500">
        Formulas match Pivot Design 1.0 (October 3, 2001). Application rates are estimates — they depend on GPM, PSI, and
        end-gun throw you enter.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_TOOLS.filter((t) => t.id !== "job").map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-700"
          >
            <p className="font-semibold text-emerald-900">{tool.title}</p>
            <p className="mt-1 text-sm text-stone-600">{tool.description}</p>
          </Link>
        ))}
      </div>
    </DesignChrome>
  );
}
