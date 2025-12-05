"use client";

import { useState } from "react";

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
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className={`h-5 w-5 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  team.isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                {team.isActive ? "Attivo" : "Nascosto"}
              </span>
              <span className="text-xs text-gray-500">
                {team.employees.length} dipendente{team.employees.length !== 1 ? "i" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRename(team)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            title="Rinomina team"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifica
          </button>
          <button
            type="button"
            onClick={() => onToggle(team)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            title={team.isActive ? "Nascondi team" : "Mostra team"}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {team.isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              )}
            </svg>
            {team.isActive ? "Nascondi" : "Mostra"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(team)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            title="Elimina team"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Elimina
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dipendenti</p>
            <button
              type="button"
              onClick={() => onAddEmployee(team)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B2436]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Aggiungi dipendente
            </button>
          </div>

          {team.employees.length === 0 ? (
            <div className="py-8 text-center rounded-xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-500">Nessun dipendente presente. Aggiungine uno per iniziare.</p>
            </div>
          ) : (
            <div className="space-y-2">
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
      )}
    </section>
  );
};

export default TeamCard;
