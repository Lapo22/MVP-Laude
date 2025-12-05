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
    setError(null);
  };

  const openRenameTeam = (team: AdminTeam) => {
    setTeamName(team.name);
    setTeamForm({ mode: "rename", team });
    setError(null);
  };

  const openCreateEmployee = (team: AdminTeam) => {
    setEmployeeName("");
    setEmployeeRole("");
    setEmployeeForm({ mode: "create", team });
    setError(null);
  };

  const openEditEmployee = (team: AdminTeam, employee: AdminEmployee) => {
    setEmployeeName(employee.name);
    setEmployeeRole(employee.role);
    setEmployeeForm({ mode: "edit", team, employee });
    setError(null);
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
      setError(null);
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTeam = async (team: AdminTeam) => {
    try {
      setLoading(true);
      setError(null);
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
      setError(null);
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEditEmployee = async () => {
    if (!employeeForm) return;
    if (!employeeName.trim() || !employeeRole.trim()) {
      setError("Nome e ruolo sono obbligatori.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployee = async (employee: AdminEmployee) => {
    try {
      setLoading(true);
      setError(null);
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
      setError(null);
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
      setTimeout(() => setMessage(null), 3000);
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
          <h2 className="text-lg font-semibold text-gray-900">Team</h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeTeamCount} attivi · {teams.reduce((acc, team) => acc + team.employees.length, 0)} dipendenti totali
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateTeam}
          className="inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2436]"
        >
          Aggiungi team
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {teams.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Nessun team presente. Usa "Aggiungi team" per iniziare.
            </p>
          </div>
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
        title={teamForm?.mode === "create" ? "Crea team" : "Rinomina team"}
        onClose={() => setTeamForm(null)}
      >
        <label className="block text-sm font-medium text-gray-700">
          Nome team
          <input
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10"
            placeholder="es. Reception"
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-3 pt-4">
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
            className="inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2436] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Salvataggio…" : teamForm?.mode === "create" ? "Crea team" : "Salva modifiche"}
          </button>
        </div>
      </Modal>

      {/* Employee Modal */}
      <Modal
        open={Boolean(employeeForm)}
        title={
          employeeForm?.mode === "create"
            ? `Aggiungi dipendente · ${employeeForm.team.name}`
            : `Modifica dipendente · ${employeeForm?.team.name}`
        }
        onClose={() => setEmployeeForm(null)}
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Nome
            <input
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10"
              placeholder="es. Mario Rossi"
              autoFocus
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Ruolo
            <input
              value={employeeRole}
              onChange={(event) => setEmployeeRole(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10"
              placeholder="es. Concierge"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-4">
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
            className="inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2436] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Salvataggio…" : employeeForm?.mode === "create" ? "Aggiungi dipendente" : "Salva modifiche"}
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        open={Boolean(confirmState)}
        title={
          confirmState?.type === "deleteTeam"
            ? "Eliminare questo team?"
            : "Eliminare questo dipendente?"
        }
        onClose={() => setConfirmState(null)}
      >
        <p className="text-sm text-gray-600">
          {confirmState?.type === "deleteTeam"
            ? "Sei sicuro di voler eliminare questo team? Tutti i voti associati verranno rimossi. Questa azione non può essere annullata."
            : "Sei sicuro di voler eliminare questo dipendente? Tutti i voti associati verranno rimossi. Questa azione non può essere annullata."}
        </p>
        <div className="flex justify-end gap-3 pt-4">
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
            className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Eliminazione…" : "Elimina"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamManager;
