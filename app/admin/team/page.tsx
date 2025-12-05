import TeamManager from "@/components/admin/team/TeamManager";
import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import type { AdminTeam } from "@/components/admin/team/types";

type TeamRow = {
  id: string;
  name: string;
  is_active: boolean;
  employees: EmployeeRow[] | null;
};

type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
};

const mapTeams = (rows: TeamRow[]): AdminTeam[] =>
  rows.map((team) => ({
    id: team.id,
    name: team.name,
    isActive: team.is_active,
    employees:
      team.employees?.map((employee) => ({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        isActive: employee.is_active,
        teamId: team.id,
      })) ?? [],
  }));

export default async function AdminTeamPage() {
  const { structure } = await requireManagerContext();
  const supabase = await createSupabaseServerClient();

  const { data: teamRows, error } = await supabase
    .from("teams")
    .select("id, name, is_active, employees (id, name, role, is_active)")
    .eq("structure_id", structure.id)
    .order("name", { ascending: true })
    .order("name", { referencedTable: "employees", ascending: true });

  if (error) {
    throw new Error(`Impossibile caricare i team: ${error.message}`);
  }

  const teams = mapTeams((teamRows ?? []) as TeamRow[]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Team & Dipendenti</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gestisci i team e i dipendenti visibili ai tuoi ospiti
        </p>
      </div>
      <TeamManager initialTeams={teams} />
    </div>
  );
}
