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
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{employee.name}</p>
        <p className="text-xs text-gray-500">{employee.role}</p>
        <span
          className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            employee.isActive
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {employee.isActive ? "Attivo" : "Nascosto"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(employee)}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
        >
          Modifica
        </button>
        <button
          type="button"
          onClick={() => onToggle(employee)}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
        >
          {employee.isActive ? "Nascondi" : "Mostra"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(employee)}
          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
        >
          Elimina
        </button>
      </div>
    </div>
  );
};

export default EmployeeRow;
