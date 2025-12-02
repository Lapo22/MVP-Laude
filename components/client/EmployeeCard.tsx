"use client";

import RatingFaces, { type RatingValue } from "./RatingFaces";
import type { Employee } from "@/types";

type EmployeeCardProps = {
  employee: Employee;
  selection: RatingValue | null;
  disabled: boolean;
  onSelect: (value: RatingValue | null) => void;
};

const EmployeeCard = ({
  employee,
  selection,
  disabled,
  onSelect,
}: EmployeeCardProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{employee.name}</p>
        <p className="mt-0.5 text-sm text-gray-500">{employee.role}</p>
      </div>
      <div className="flex justify-start md:justify-end">
        <RatingFaces
          ariaLabel={`${employee.name} (${employee.role}) rating`}
          currentSelection={selection}
          disabled={disabled}
          onSelect={onSelect}
          size="sm"
        />
      </div>
    </div>
  );
};

export default EmployeeCard;
