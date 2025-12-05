"use client";

import { useRouter, useSearchParams } from "next/navigation";

type PeriodFilterProps = {
  currentPeriod: "7d" | "30d" | "all";
  basePath?: string;
};

const PeriodFilter = ({ currentPeriod, basePath = "/admin" }: PeriodFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (period: "7d" | "30d" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "30d") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    router.push(`${basePath}?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => handlePeriodChange("7d")}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentPeriod === "7d"
            ? "bg-[#0F172A] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Ultimi 7 giorni
      </button>
      <button
        type="button"
        onClick={() => handlePeriodChange("30d")}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentPeriod === "30d"
            ? "bg-[#0F172A] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Ultimi 30 giorni
      </button>
      <button
        type="button"
        onClick={() => handlePeriodChange("all")}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentPeriod === "all"
            ? "bg-[#0F172A] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Sempre
      </button>
    </div>
  );
};

export default PeriodFilter;
