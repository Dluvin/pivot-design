"use client";

import { useEffect, useState } from "react";
import { COMPANY_EVENT, DEFAULT_COMPANY, getCompany, RELOAD_EVENT, type CompanyProfile } from "@/lib/design/project";

export function useCompany() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  useEffect(() => {
    function load() {
      setCompany(getCompany());
    }
    load();
    window.addEventListener(RELOAD_EVENT, load);
    window.addEventListener(COMPANY_EVENT, load);
    return () => {
      window.removeEventListener(RELOAD_EVENT, load);
      window.removeEventListener(COMPANY_EVENT, load);
    };
  }, []);
  return company;
}

export function PrintBrand({
  customer,
  fieldName,
  sheet,
  preview,
}: {
  customer?: string;
  fieldName?: string;
  sheet: string;
  preview?: boolean;
}) {
  const company = useCompany();
  return (
    <div
      className={`mb-4 items-center justify-between gap-4 border-b border-stone-300 pb-3 ${
        preview ? "flex" : "hidden print:flex"
      }`}
    >
      <div className="flex items-center gap-3">
        {company.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logoDataUrl} alt="" className="h-14 max-w-40 object-contain" />
        ) : null}
        <div>
          <p className="font-display text-xl">{company.businessName || "Pivot Design"}</p>
          <p className="text-sm text-stone-600">{sheet}</p>
        </div>
      </div>
      <div className="text-right text-sm text-stone-700">
        <p className="font-medium">{customer || "Unnamed job"}</p>
        {fieldName ? <p>{fieldName}</p> : null}
        <p className="text-stone-500">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export function ScreenBrand() {
  const company = useCompany();
  return (
    <span className="text-xs text-emerald-200">{company.businessName || "Pivot Design"}</span>
  );
}
