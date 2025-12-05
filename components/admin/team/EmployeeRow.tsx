"use client";

import type { AdminEmployee } from "./types";

type EmployeeRowProps = {
  employee: AdminEmployee;
  onEdit: (employee: AdminEmployee) => void;
  onToggle: (employee: AdminEmployee) => void;
  onDelete: (employee: AdminEmployee) => void;
};

const EmployeeRow = ({ employee, onEdit, onToggle, onDelete }: EmployeeRowProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              employee.isActive
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {employee.isActive ? "Attivo" : "Nascosto"}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-600">{employee.role}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(employee)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          title="Modifica dipendente"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modifica
        </button>
        <button
          type="button"
          onClick={() => onToggle(employee)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          title={employee.isActive ? "Nascondi dipendente" : "Mostra dipendente"}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {employee.isActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            )}
          </svg>
          {employee.isActive ? "Nascondi" : "Mostra"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(employee)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          title="Elimina dipendente"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Elimina
        </button>
      </div>
    </div>
  );
};

export default EmployeeRow;
