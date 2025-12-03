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
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#E9E4DA] bg-white p-3.5 transition-all duration-150 hover:bg-[#FAFAF8] hover:shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <p className="font-medium tracking-wide text-[#1F2933]">{employee.name}</p>
        <p className="mt-0.5 text-sm tracking-wide text-[#6A6A6A]">— {employee.role}</p>
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
