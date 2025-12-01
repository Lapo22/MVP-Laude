"use client";

import RatingFaces, { type RatingValue } from "./RatingFaces";
import type { Employee } from "@/types";

type EmployeeCardProps = {
  employee: Employee;
  selection: RatingValue | null;
  disabled: boolean;
  onSelect: (value: RatingValue) => void;
};

const EmployeeCard = ({
  employee,
  selection,
  disabled,
  onSelect,
}: EmployeeCardProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white py-2.5 transition-colors hover:bg-gray-50 md:flex-row md:items-center md:justify-between md:px-3">
      <div className="flex-1 px-3 md:px-0">
        <p className="font-medium text-gray-900">{employee.name}</p>
        <p className="text-xs text-gray-500">{employee.role}</p>
      </div>
      <div className="flex justify-start px-3 md:justify-end md:px-0">
        <RatingFaces
          ariaLabel={`${employee.name} rating`}
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
