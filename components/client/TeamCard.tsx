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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-4 text-left transition-colors hover:bg-gray-50/50 disabled:cursor-not-allowed disabled:opacity-60"
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 md:text-xl">{team.name}</h2>
          <p className="mt-1 text-sm text-gray-600">Team</p>
        </div>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded && (
        <div className="mt-5 space-y-5 border-t border-gray-100 pt-5">
          {/* Team Rating */}
          <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Rate this team</p>
            </div>
            <RatingFaces
              ariaLabel={`${team.name} team rating`}
              currentSelection={teamSelection ?? null}
              disabled={disabled}
              onSelect={handleTeamRatingSelect}
              size="md"
            />
          </div>

          {/* Staff Members */}
          {team.employees.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
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
