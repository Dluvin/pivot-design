"use client";

import { DEFAULT_JOB, JOB_KEY, MAINLINE_PSI_KEY, type DesignJob } from "@/lib/design/job";
import { IPS_PIPE, PIP_PIPE } from "@/lib/design/lookups";
import { computeMainlinePressure, type MainlinePressureInput } from "@/lib/design/mainline-pressure";
import { DesignChrome, Input, JobLine, Result, Select, YellowHint, fmt } from "@/components/design/DesignChrome";
import { usePersistentState } from "@/components/design/usePersistentState";

const DEFAULT_MP: MainlinePressureInput = {
  gpm: 800,
  lengthFt: 640,
  cIndex: 1,
  pipeKind: "pip",
  nomSize: 8,
  psiRating: 125,
  customOd: 8,
  customWall: 0.105,
};

export function MainlinePressureForm() {
  const [job] = usePersistentState<DesignJob>(JOB_KEY, DEFAULT_JOB);
  const [input, setInput] = usePersistentState<MainlinePressureInput>(MAINLINE_PSI_KEY, DEFAULT_MP);
  const result = computeMainlinePressure(input);
  function patch(partial: Partial<MainlinePressureInput>) {
    setInput({ ...input, ...partial });
  }
  const sizes = input.pipeKind === "ips" ? Object.keys(IPS_PIPE) : Object.keys(PIP_PIPE);
  const velocityHigh = result.velocity > 5;
  const velocityMpsHigh = result.velocityMps > 1.6;

  return (
    <DesignChrome title="Mainline pressure loss" subtitle="Hazen-Williams friction on PIP, IPS, or custom wall pipe." active="mainline-pressure">
      <JobLine {...job} />
      <YellowHint />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="GPM" type="number" value={input.gpm} onChange={(v) => patch({ gpm: Number(v) })} />
        <Input label="Pipe length, ft" type="number" value={input.lengthFt} onChange={(v) => patch({ lengthFt: Number(v) })} />
        <Select
          label="C-factor"
          value={String(input.cIndex)}
          onChange={(v) => patch({ cIndex: Number(v) as MainlinePressureInput["cIndex"] })}
          options={[
            { value: "1", label: "150 (new plastic)" },
            { value: "2", label: "140" },
            { value: "3", label: "130" },
            { value: "4", label: "120" },
            { value: "5", label: "100" },
          ]}
        />
        <Select
          label="Pipe type"
          value={input.pipeKind}
          onChange={(v) => patch({ pipeKind: v as MainlinePressureInput["pipeKind"] })}
          options={[
            { value: "pip", label: "PIP plastic irrigation" },
            { value: "ips", label: "IPS thermoplastic" },
            { value: "custom", label: "Custom OD / wall" },
          ]}
        />
        {input.pipeKind !== "custom" ? (
          <>
            <Select
              label="Nom. size, in"
              value={String(input.nomSize)}
              onChange={(v) => patch({ nomSize: Number(v) })}
              options={sizes.map((s) => ({ value: s, label: s }))}
            />
            <Input label="PSI rating" type="number" value={input.psiRating} onChange={(v) => patch({ psiRating: Number(v) })} />
          </>
        ) : (
          <>
            <Input label="Pipe OD, in" type="number" step="0.001" value={input.customOd} onChange={(v) => patch({ customOd: Number(v) })} />
            <Input label="Wall, in" type="number" step="0.001" value={input.customWall} onChange={(v) => patch({ customWall: Number(v) })} />
          </>
        )}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Result label="Pipe ID, in" value={fmt(result.id, 3)} />
        <Result label="Friction, ft" value={fmt(result.headFt)} />
        <Result label="Friction, psi" value={fmt(result.psi)} />
        <Result label="Friction, bar" value={fmt(result.bar, 3)} />
        <Result label="Velocity, ft/s" value={fmt(result.velocity)} warn={velocityHigh} />
        <Result label="Velocity, m/s" value={fmt(result.velocityMps, 3)} warn={velocityMpsHigh} />
      </div>
      {velocityHigh ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          Warning — velocity exceeds 5.0 ft/s. Increase pipe size or reduce GPM.
        </p>
      ) : null}
      {velocityMpsHigh ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          Warning — velocity exceeds 1.6 m/s. Increase pipe size or reduce flow.
        </p>
      ) : null}
    </DesignChrome>
  );
}
