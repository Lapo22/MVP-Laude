"use client";

import { useState } from "react";
import TeamVotesTable from "./TeamVotesTable";
import EmployeeVotesTable from "./EmployeeVotesTable";
import VoteDetailModal from "./VoteDetailModal";

type TeamStat = {
  id: string;
  name: string;
  totalVotes: number;
  averageRating: number | null;
  lastVoteAt: string | null;
};

type EmployeeStat = {
  id: string;
  name: string;
  role: string;
  teamId: string | null;
  teamName: string | null;
  totalVotes: number;
  averageRating: number | null;
  lastVoteAt: string | null;
};

type VotesOverviewProps = {
  totalVotes: number;
  averageRating: number | null;
  entitiesWithVotes: number;
  teamStats: TeamStat[];
  employeeStats: EmployeeStat[];
};

const VotesOverview = ({
  totalVotes,
  averageRating,
  entitiesWithVotes,
  teamStats,
  employeeStats,
}: VotesOverviewProps) => {
  const [activeTab, setActiveTab] = useState<"team" | "employee">("team");
  const [detailModal, setDetailModal] = useState<{
    type: "team" | "employee";
    id: string;
    name: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Totale voti</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalVotes}</p>
          <p className="mt-1 text-sm text-gray-600">Nel periodo selezionato</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Media generale</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {averageRating !== null ? averageRating.toFixed(1) : "–"}
          </p>
          <p className="mt-1 text-sm text-gray-600">Su scala 1-3</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Team/Dipendenti con voti</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{entitiesWithVotes}</p>
          <p className="mt-1 text-sm text-gray-600">Con almeno un voto</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "team"
              ? "bg-[#0F172A] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Per team
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("employee")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "employee"
              ? "bg-[#0F172A] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Per dipendente
        </button>
      </div>

      {/* Tables */}
      {activeTab === "team" ? (
        <TeamVotesTable
          teams={teamStats}
          onViewDetails={(id, name) => setDetailModal({ type: "team", id, name })}
        />
      ) : (
        <EmployeeVotesTable
          employees={employeeStats}
          onViewDetails={(id, name) => setDetailModal({ type: "employee", id, name })}
        />
      )}

      {/* Detail Modal */}
      {detailModal && (
        <VoteDetailModal
          type={detailModal.type}
          id={detailModal.id}
          name={detailModal.name}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
};

export default VotesOverview;

