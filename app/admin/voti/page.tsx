import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import PeriodFilter from "@/components/admin/dashboard/PeriodFilter";
import VotesOverview from "@/components/admin/votes/VotesOverview";

type SearchParams = Promise<{ period?: string }>;

const getPeriodStartDate = (period: "7d" | "30d" | "all"): string | null => {
  if (period === "all") return null;
  const date = new Date();
  date.setDate(date.getDate() - (period === "7d" ? 7 : 30));
  return date.toISOString();
};

export default async function AdminVotiPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: false,
  });

  const params = await searchParams;
  const periodParam = (params.period as "7d" | "30d" | "all") || "30d";
  const periodStartDate = getPeriodStartDate(periodParam);

  // Query per tutti i voti nel periodo
  const votesQuery = supabase
    .from("votes")
    .select("id, rating, team_id, employee_id, created_at")
    .eq("structure_id", structure.id);
  if (periodStartDate) {
    votesQuery.gte("created_at", periodStartDate);
  }
  const { data: allVotes } = await votesQuery.order("created_at", { ascending: false });

  // Calcola statistiche generali
  const totalVotes = allVotes?.length || 0;
  const averageRating =
    allVotes && allVotes.length > 0
      ? allVotes.reduce((sum, vote) => sum + vote.rating, 0) / allVotes.length
      : null;

  // Raccogli team_id e employee_id unici
  const teamIds = new Set<string>();
  const employeeIds = new Set<string>();
  allVotes?.forEach((vote) => {
    if (vote.team_id) teamIds.add(vote.team_id);
    if (vote.employee_id) employeeIds.add(vote.employee_id);
  });

  // Carica dati team
  const { data: teamsData } =
    teamIds.size > 0
      ? await supabase
          .from("teams")
          .select("id, name")
          .eq("structure_id", structure.id)
          .in("id", Array.from(teamIds))
      : { data: [] };

  // Carica dati dipendenti con team
  const { data: employeesData } =
    employeeIds.size > 0
      ? await supabase
          .from("employees")
          .select("id, name, role, team_id")
          .eq("structure_id", structure.id)
          .in("id", Array.from(employeeIds))
      : { data: [] };

  // Carica nomi team per i dipendenti
  const teamIdsForEmployees = new Set(
    employeesData?.map((e) => e.team_id).filter(Boolean) || [],
  );
  const { data: teamsForEmployees } =
    teamIdsForEmployees.size > 0
      ? await supabase
          .from("teams")
          .select("id, name")
          .in("id", Array.from(teamIdsForEmployees))
      : { data: [] };

  const teamNameMap = new Map(teamsForEmployees?.map((t) => [t.id, t.name]) || []);

  // Calcola statistiche per team
  const teamStatsMap = new Map<
    string,
    { ratings: number[]; lastVoteAt: string | null }
  >();

  allVotes?.forEach((vote) => {
    if (!vote.team_id) return;
    const existing = teamStatsMap.get(vote.team_id) || {
      ratings: [],
      lastVoteAt: null,
    };
    existing.ratings.push(vote.rating);
    if (!existing.lastVoteAt || vote.created_at > existing.lastVoteAt) {
      existing.lastVoteAt = vote.created_at;
    }
    teamStatsMap.set(vote.team_id, existing);
  });

  const teamStats =
    teamsData?.map((team) => {
      const stats = teamStatsMap.get(team.id);
      return {
        id: team.id,
        name: team.name,
        totalVotes: stats?.ratings.length || 0,
        averageRating:
          stats && stats.ratings.length > 0
            ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
            : null,
        lastVoteAt: stats?.lastVoteAt || null,
      };
    }) || [];

  // Calcola statistiche per dipendente
  const employeeStatsMap = new Map<
    string,
    { ratings: number[]; lastVoteAt: string | null }
  >();

  allVotes?.forEach((vote) => {
    if (!vote.employee_id) return;
    const existing = employeeStatsMap.get(vote.employee_id) || {
      ratings: [],
      lastVoteAt: null,
    };
    existing.ratings.push(vote.rating);
    if (!existing.lastVoteAt || vote.created_at > existing.lastVoteAt) {
      existing.lastVoteAt = vote.created_at;
    }
    employeeStatsMap.set(vote.employee_id, existing);
  });

  const employeeStats =
    employeesData?.map((employee) => {
      const stats = employeeStatsMap.get(employee.id);
      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        teamId: employee.team_id,
        teamName: employee.team_id ? teamNameMap.get(employee.team_id) || null : null,
        totalVotes: stats?.ratings.length || 0,
        averageRating:
          stats && stats.ratings.length > 0
            ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
            : null,
        lastVoteAt: stats?.lastVoteAt || null,
      };
    }) || [];

  // Conta team/dipendenti con almeno un voto
  const teamsWithVotes = teamStats.filter((t) => t.totalVotes > 0).length;
  const employeesWithVotes = employeeStats.filter((e) => e.totalVotes > 0).length;
  const entitiesWithVotes = teamsWithVotes + employeesWithVotes;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Voti</h1>
        <p className="mt-2 text-sm text-gray-500">
          Statistiche dettagliate sui voti ricevuti da team e dipendenti.
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex justify-end">
        <PeriodFilter currentPeriod={periodParam} basePath="/admin/voti" />
      </div>

      {/* Overview Cards */}
      <VotesOverview
        totalVotes={totalVotes}
        averageRating={averageRating}
        entitiesWithVotes={entitiesWithVotes}
        teamStats={teamStats}
        employeeStats={employeeStats}
      />
    </div>
  );
}

