"use client";

import { format } from "date-fns";
import { it } from "date-fns/locale";

type DailyStat = {
  day: string; // YYYY-MM-DD
  countVotes: number;
  avgRating: number | null;
};

type DailyStatsTableProps = {
  stats: DailyStat[];
};

const DailyStatsTable = ({ stats }: DailyStatsTableProps) => {
  if (stats.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Andamento ultimi 7 giorni</h3>
        <p className="mt-3 text-sm text-gray-500">Nessun voto registrato negli ultimi 7 giorni.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Andamento ultimi 7 giorni</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                Data
              </th>
              <th className="pb-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                Voti
              </th>
              <th className="pb-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                Media rating
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => {
              const date = new Date(stat.day);
              return (
                <tr key={stat.day} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">
                    {format(date, "dd/MM", { locale: it })}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900">{stat.countVotes}</td>
                  <td className="py-3 text-sm text-gray-600">
                    {stat.avgRating !== null ? `${stat.avgRating.toFixed(1)} / 3` : "–"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyStatsTable;

