"use client";

import type { AdminEmployee, AdminTeam } from "./types";
import EmployeeRow from "./EmployeeRow";

type TeamCardProps = {
  team: AdminTeam;
  onRename: (team: AdminTeam) => void;
  onToggle: (team: AdminTeam) => void;
  onDelete: (team: AdminTeam) => void;
  onAddEmployee: (team: AdminTeam) => void;
  onEditEmployee: (team: AdminTeam, employee: AdminEmployee) => void;
  onToggleEmployee: (employee: AdminEmployee) => void;
  onDeleteEmployee: (team: AdminTeam, employee: AdminEmployee) => void;
};

const TeamCard = ({
  team,
  onRename,
  onToggle,
  onDelete,
  onAddEmployee,
  onEditEmployee,
  onToggleEmployee,
  onDeleteEmployee,
}: TeamCardProps) => {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                team.isActive
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {team.isActive ? "Attivo" : "Nascosto"}
            </span>
          </div>
          <p className="text-sm text-gray-500">Visibile nella pagina pubblica QR</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRename(team)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
          >
            Rinomina
          </button>
          <button
            type="button"
            onClick={() => onToggle(team)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
          >
            {team.isActive ? "Nascondi" : "Mostra"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(team)}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
          >
            Elimina
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dipendenti</p>
          <button
            type="button"
            onClick={() => onAddEmployee(team)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Aggiungi dipendente
          </button>
        </div>

        {team.employees.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">Non hai ancora aggiunto dipendenti a questo team.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {team.employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                onEdit={(emp) => onEditEmployee(team, emp)}
                onToggle={onToggleEmployee}
                onDelete={(emp) => onDeleteEmployee(team, emp)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamCard;
