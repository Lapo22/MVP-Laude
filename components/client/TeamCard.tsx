"use client";

import { useState } from "react";

import RatingFaces, { type RatingValue } from "./RatingFaces";
import EmployeeCard from "./EmployeeCard";
import type { TeamWithEmployees } from "./types";

type TeamCardProps = {
  team: TeamWithEmployees;
  structureId: string;
  disabled: boolean;
  selections: Record<string, RatingValue>;
  onRatingSelect: (entityKey: string, rating: RatingValue | null) => void;
};

const TeamCard = ({
  team,
  structureId,
  disabled,
  selections,
  onRatingSelect,
}: TeamCardProps) => {
  const teamKey = `team-${team.id}`;
  const teamSelection = selections[teamKey] ?? null;

  const [expanded, setExpanded] = useState(Boolean(teamSelection) || team.employees.length > 0);

  const handleTeamRatingSelect = (rating: RatingValue | null) => {
    onRatingSelect(teamKey, rating);
    if (rating !== null && !expanded) {
      setExpanded(true);
    }
  };

  const toggleExpanded = () => {
    if (!disabled) {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#E9E4DA] bg-gradient-to-b from-white to-[#F9F6F1] shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
      <div className="absolute inset-0 rounded-3xl border-[0.5px] border-[#D9C8A0]/50 pointer-events-none"></div>
      
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={disabled}
        className="relative flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <h2 className="font-serif text-lg font-medium tracking-tight text-[#0F172A] md:text-xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {team.name}
          </h2>
          <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#6A6A6A] md:text-[10px]">
            Team
          </p>
          <div className="mt-2 h-px w-8 bg-[#C9A15B]"></div>
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-[#6A6A6A] transition-transform duration-200 ease-in-out ${
            expanded ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          strokeWidth={1.5}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded && (
        <div className="relative border-t border-[#E9E4DA] bg-gradient-to-b from-white/50 to-[#F9F6F1]/50 px-5 pb-5 pt-5 transition-all duration-200 ease-in-out">
          <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1F2933]">Rate this team</p>
            </div>
            <RatingFaces
              ariaLabel={`${team.name} team rating`}
              currentSelection={teamSelection ?? null}
              disabled={disabled}
              onSelect={handleTeamRatingSelect}
              size="md"
            />
          </div>

          {team.employees.length > 0 && (
            <div className="space-y-2.5 border-t border-[#E9E4DA] pt-4">
              <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.1em] text-[#6A6A6A] md:text-[10px]">
                Staff members
              </p>
              <div className="space-y-2">
                {team.employees.map((employee) => {
                  const employeeKey = `employee-${employee.id}`;
                  return (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      selection={selections[employeeKey] ?? null}
                      disabled={disabled}
                      onSelect={(rating) => onRatingSelect(employeeKey, rating)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TeamCard;
