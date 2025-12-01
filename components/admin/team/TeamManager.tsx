"use client";

import { useCallback, useMemo, useState } from "react";

import Modal from "./Modal";
import TeamCard from "./TeamCard";
import type { AdminEmployee, AdminTeam } from "./types";

type TeamManagerProps = {
  initialTeams: AdminTeam[];
};

type TeamFormState =
  | { mode: "create" }
  | { mode: "rename"; team: AdminTeam }
  | null;

type EmployeeFormState =
  | { mode: "create"; team: AdminTeam }
  | { mode: "edit"; team: AdminTeam; employee: AdminEmployee }
  | null;

type ConfirmState =
  | { type: "deleteTeam"; team: AdminTeam }
  | { type: "deleteEmployee"; team: AdminTeam; employee: AdminEmployee }
  | null;

const TeamManager = ({ initialTeams }: TeamManagerProps) => {
  const [teams, setTeams] = useState<AdminTeam[]>(initialTeams);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [teamForm, setTeamForm] = useState<TeamFormState>(null);
  const [teamName, setTeamName] = useState("");

  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");

  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const openCreateTeam = () => {
    setTeamName("");
    setTeamForm({ mode: "create" });
  };

  const openRenameTeam = (team: AdminTeam) => {
    setTeamName(team.name);
    setTeamForm({ mode: "rename", team });
  };

  const openCreateEmployee = (team: AdminTeam) => {
    setEmployeeName("");
    setEmployeeRole("");
    setEmployeeForm({ mode: "create", team });
  };

  const openEditEmployee = (team: AdminTeam, employee: AdminEmployee) => {
    setEmployeeName(employee.name);
    setEmployeeRole(employee.role);
    setEmployeeForm({ mode: "edit", team, employee });
  };

  const refreshTeams = useCallback(async () => {
    const response = await fetch("/api/admin/teams", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) {
      setTeams(payload.teams ?? []);
      setError(null);
    } else {
      setError(payload.error ?? "Impossibile aggiornare l'elenco dei team.");
    }
  }, []);

  const handleCreateOrRenameTeam = async () => {
    if (!teamForm) return;
    if (!teamName.trim()) {
      setError("Il nome del team è obbligatorio.");
      return;
    }

    try {
      setLoading(true);
      if (teamForm.mode === "create") {
        const response = await fetch("/api/admin/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: teamName.trim() }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossibile creare il team.");
        }
        setMessage("Team creato con successo.");
      } else {
        const response = await fetch(`/api/admin/teams/${teamForm.team.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: teamName.trim() }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossibile rinominare il team.");
        }
        setMessage("Team aggiornato con successo.");
      }
      setTeamForm(null);
      await refreshTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTeam = async (team: AdminTeam) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !team.isActive }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile aggiornare il team.");
      }
      await refreshTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirmState || confirmState.type !== "deleteTeam") return;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/teams/${confirmState.team.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile eliminare il team.");
      }
      setMessage("Team eliminato con successo.");
      setConfirmState(null);
      await refreshTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEditEmployee = async () => {
    if (!employeeForm) return;
    if (!employeeName.trim() || !employeeRole.trim()) {
      setError("Nome e ruolo del dipendente sono obbligatori.");
      return;
    }

    try {
      setLoading(true);
      if (employeeForm.mode === "create") {
        const response = await fetch("/api/admin/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: employeeForm.team.id,
            name: employeeName.trim(),
            role: employeeRole.trim(),
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossibile creare il dipendente.");
        }
        setMessage("Dipendente creato con successo.");
      } else {
        const response = await fetch(`/api/admin/employees/${employeeForm.employee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: employeeName.trim(),
            role: employeeRole.trim(),
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossibile aggiornare il dipendente.");
        }
        setMessage("Dipendente aggiornato con successo.");
      }

      setEmployeeForm(null);
      await refreshTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployee = async (employee: AdminEmployee) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !employee.isActive }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile aggiornare il dipendente.");
      }
      await refreshTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!confirmState || confirmState.type !== "deleteEmployee") return;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/employees/${confirmState.employee.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile eliminare il dipendente.");
      }
      setMessage("Dipendente eliminato con successo.");
      setConfirmState(null);
      await refreshTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const activeTeamCount = useMemo(
    () => teams.filter((team) => team.isActive).length,
    [teams],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">Team & Dipendenti</h1>
          <p className="mt-1 text-sm text-gray-500">Gestisci i team e il personale visibile ai tuoi ospiti</p>
          <p className="mt-2 text-xs text-gray-400">
            Team attivi: {activeTeamCount} · Dipendenti complessivi:{" "}
            {teams.reduce((acc, team) => acc + team.employees.length, 0)}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateTeam}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Aggiungi team
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {teams.length === 0 ? (
          <p className="text-sm text-gray-500">
            Non hai ancora creato team. Usa “Aggiungi team” per iniziare.
          </p>
        ) : (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onRename={openRenameTeam}
              onToggle={handleToggleTeam}
              onDelete={(t) => setConfirmState({ type: "deleteTeam", team: t })}
              onAddEmployee={openCreateEmployee}
              onEditEmployee={openEditEmployee}
              onToggleEmployee={handleToggleEmployee}
              onDeleteEmployee={(team, employee) => setConfirmState({ type: "deleteEmployee", team, employee })}
            />
          ))
        )}
      </div>

      {/* Team Modal */}
      <Modal
        open={Boolean(teamForm)}
        title={teamForm?.mode === "create" ? "Nuovo team" : "Rinomina team"}
        onClose={() => setTeamForm(null)}
      >
        <label className="block text-sm font-medium text-gray-700">
          Nome team
          <input
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            placeholder="Es. Reception"
          />
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTeamForm(null)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleCreateOrRenameTeam}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </Modal>

      {/* Employee Modal */}
      <Modal
        open={Boolean(employeeForm)}
        title={
          employeeForm?.mode === "create"
            ? `Nuovo dipendente · ${employeeForm.team.name}`
            : `Modifica dipendente · ${employeeForm?.team.name}`
        }
        onClose={() => setEmployeeForm(null)}
      >
        <label className="block text-sm font-medium text-gray-700">
          Nome
          <input
            value={employeeName}
            onChange={(event) => setEmployeeName(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            placeholder="Es. Maria Rossi"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Ruolo
          <input
            value={employeeRole}
            onChange={(event) => setEmployeeRole(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            placeholder="Es. Concierge"
          />
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setEmployeeForm(null)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleCreateOrEditEmployee}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        open={Boolean(confirmState)}
        title={
          confirmState?.type === "deleteTeam"
            ? "Elimina definitivamente questo team?"
            : "Elimina definitivamente questo dipendente?"
        }
        onClose={() => setConfirmState(null)}
      >
        <p className="text-sm text-gray-600">
          {confirmState?.type === "deleteTeam"
            ? "Perderai tutti i dipendenti e i voti associati a questo team. Questa azione non può essere annullata."
            : "Perderai i voti associati a questo dipendente. Questa azione non può essere annullata."}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setConfirmState(null)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={confirmState?.type === "deleteTeam" ? handleDeleteTeam : handleDeleteEmployee}
            className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Eliminazione…" : "Elimina"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamManager;

