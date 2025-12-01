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
  onRatingSelect: (entityKey: string, rating: RatingValue) => void;
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

  const [expanded, setExpanded] = useState(Boolean(teamSelection));

  const handleTeamRatingSelect = (rating: RatingValue) => {
    onRatingSelect(teamKey, rating);
    if (!expanded) {
      setExpanded(true);
    }
  };

  const toggleExpanded = () => {
    if (!disabled) {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-4 text-left transition-colors hover:bg-gray-50/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 md:text-xl">{team.name}</h2>
          <p className="text-xs text-gray-500 md:text-sm">Rate this team and its staff</p>
        </div>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
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

      {expanded ? (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {/* Sezione voto team */}
          <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Team rating</p>
            </div>
            <RatingFaces
              ariaLabel={`${team.name} rating`}
              currentSelection={teamSelection ?? null}
              disabled={disabled}
              onSelect={handleTeamRatingSelect}
            />
          </div>

          {/* Lista dipendenti */}
          {team.employees.length > 0 ? (
            <div className="space-y-3 border-t border-gray-100 pt-3">
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
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default TeamCard;
