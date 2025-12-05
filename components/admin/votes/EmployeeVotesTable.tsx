"use client";

import { format } from "date-fns";
import { it } from "date-fns/locale";

type EmployeeStat = {
  id: string;
  name: string;
  role: string;
  teamId: string | null;
  teamName: string | null;
  totalVotes: number;
  averageRating: number | null;
  lastVoteAt: string | null;
};

type EmployeeVotesTableProps = {
  employees: EmployeeStat[];
  onViewDetails: (id: string, name: string) => void;
};

const EmployeeVotesTable = ({ employees, onViewDetails }: EmployeeVotesTableProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "–";
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy, HH:mm", { locale: it });
  };

  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">Non ci sono ancora voti per questo periodo.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Dipendente
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Team
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ruolo
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Voti
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Media
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ultimo voto
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2.5 text-sm font-medium text-gray-900">{employee.name}</td>
                <td className="py-2.5 text-sm text-gray-700">{employee.teamName || "–"}</td>
                <td className="py-2.5 text-sm text-gray-700">{employee.role}</td>
                <td className="py-2.5 text-sm text-gray-700">{employee.totalVotes}</td>
                <td className="py-2.5 text-sm text-gray-700">
                  {employee.averageRating !== null ? (
                    <span className="font-medium">{employee.averageRating.toFixed(1)}</span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="py-2.5 text-sm text-gray-600">{formatDate(employee.lastVoteAt)}</td>
                <td className="py-2.5">
                  <button
                    type="button"
                    onClick={() => onViewDetails(employee.id, employee.name)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Dettagli
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeVotesTable;

