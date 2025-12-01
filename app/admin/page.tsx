import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import PeriodFilter from "@/components/admin/dashboard/PeriodFilter";
import UsageHealthSection from "@/components/admin/dashboard/UsageHealthSection";
import TeamPerformanceTable from "@/components/admin/dashboard/TeamPerformanceTable";
import StaffInsightsSection from "@/components/admin/dashboard/StaffInsightsSection";
import IssuesOverviewSection from "@/components/admin/dashboard/IssuesOverviewSection";

type SearchParams = Promise<{ period?: string }>;

const getPeriodStartDate = (period: "7d" | "30d" | "all"): string | null => {
  if (period === "all") return null;
  const date = new Date();
  date.setDate(date.getDate() - (period === "7d" ? 7 : 30));
  return date.toISOString();
};

const MIN_FEEDBACK_FOR_STAFF_INSIGHTS = 3;

export default async function AdminDashboardPage({
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

  // Date per i calcoli "ultimi 7 giorni" (indipendenti dal filtro)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // ============================================
  // 1. USAGE & HEALTH SECTION
  // ============================================

  // Query per totale feedback nel periodo
  const totalFeedbackQuery = supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("structure_id", structure.id);
  if (periodStartDate) {
    totalFeedbackQuery.gte("created_at", periodStartDate);
  }

  const [
    { count: totalFeedbackInPeriod },
    { count: feedbackLast7Days },
  ] = await Promise.all([
    // Totale feedback nel periodo
    totalFeedbackQuery,
    // Feedback ultimi 7 giorni (indipendente dal filtro)
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structure.id)
      .gte("created_at", sevenDaysAgoISO),
  ]);

  // ============================================
  // 2. TEAM PERFORMANCE SECTION
  // ============================================

  // Recupera tutti i team con i loro voti nel periodo
  const teamVotesQuery = supabase
    .from("votes")
    .select("team_id, rating, created_at")
    .eq("structure_id", structure.id)
    .not("team_id", "is", null);
  if (periodStartDate) {
    teamVotesQuery.gte("created_at", periodStartDate);
  }
  const { data: teamVotes } = await teamVotesQuery.order("created_at", {
    ascending: false,
  });

  // Calcola statistiche per team
  const teamStatsMap = new Map<
    string,
    { ratings: number[]; lastFeedbackAt: string | null }
  >();

  if (teamVotes) {
    for (const vote of teamVotes) {
      if (!vote.team_id) continue;
      const existing = teamStatsMap.get(vote.team_id) || {
        ratings: [],
        lastFeedbackAt: null,
      };
      existing.ratings.push(vote.rating);
      if (!existing.lastFeedbackAt) {
        existing.lastFeedbackAt = vote.created_at;
      }
      teamStatsMap.set(vote.team_id, existing);
    }
  }

  // Recupera nomi dei team
  const teamIds = Array.from(teamStatsMap.keys());
  const { data: teamsData } =
    teamIds.length > 0
      ? await supabase
          .from("teams")
          .select("id, name")
          .eq("structure_id", structure.id)
          .in("id", teamIds)
      : { data: [] };

  const teamPerformanceRows =
    teamsData?.map((team) => {
      const stats = teamStatsMap.get(team.id);
      return {
        teamId: team.id,
        teamName: team.name,
        averageRating:
          stats && stats.ratings.length > 0
            ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
            : null,
        feedbackCount: stats?.ratings.length || 0,
        lastFeedbackAt: stats?.lastFeedbackAt || null,
      };
    }) || [];

  // Ordina per media più bassa (per evidenziare problemi)
  teamPerformanceRows.sort((a, b) => {
    if (a.averageRating === null && b.averageRating === null) return 0;
    if (a.averageRating === null) return 1;
    if (b.averageRating === null) return -1;
    return a.averageRating - b.averageRating;
  });

  // Issues totali nel periodo
  const issuesCountQuery = supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("structure_id", structure.id);
  if (periodStartDate) {
    issuesCountQuery.gte("created_at", periodStartDate);
  }
  const { count: totalIssuesInPeriod } = await issuesCountQuery;

  // ============================================
  // 3. STAFF INSIGHTS SECTION
  // ============================================

  // Recupera voti per dipendenti nel periodo
  const employeeVotesQuery = supabase
    .from("votes")
    .select("employee_id, rating")
    .eq("structure_id", structure.id)
    .not("employee_id", "is", null);
  if (periodStartDate) {
    employeeVotesQuery.gte("created_at", periodStartDate);
  }
  const { data: employeeVotes } = await employeeVotesQuery;

  // Calcola statistiche per dipendente
  const employeeStatsMap = new Map<
    string,
    { ratings: number[]; count: number }
  >();

  if (employeeVotes) {
    for (const vote of employeeVotes) {
      if (!vote.employee_id) continue;
      const existing = employeeStatsMap.get(vote.employee_id) || {
        ratings: [],
        count: 0,
      };
      existing.ratings.push(vote.rating);
      existing.count += 1;
      employeeStatsMap.set(vote.employee_id, existing);
    }
  }

  // Filtra dipendenti con almeno MIN_FEEDBACK_FOR_STAFF_INSIGHTS feedback
  const employeesWithEnoughFeedback = Array.from(employeeStatsMap.entries())
    .filter(([_, stats]) => stats.count >= MIN_FEEDBACK_FOR_STAFF_INSIGHTS)
    .map(([employeeId, stats]) => ({
      employeeId,
      averageRating: stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length,
      feedbackCount: stats.count,
    }));

  // Recupera dati dipendenti
  const employeeIds = employeesWithEnoughFeedback.map((e) => e.employeeId);
  const { data: employeesData } =
    employeeIds.length > 0
      ? await supabase
          .from("employees")
          .select("id, name, role, team_id")
          .eq("structure_id", structure.id)
          .in("id", employeeIds)
      : { data: [] };

  // Recupera nomi dei team per i dipendenti
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

  // Costruisci lista completa dipendenti
  const staffMembers =
    employeesData?.map((employee) => {
      const stats = employeesWithEnoughFeedback.find(
        (e) => e.employeeId === employee.id,
      );
      return {
        employeeId: employee.id,
        name: employee.name,
        role: employee.role,
        teamName: employee.team_id ? teamNameMap.get(employee.team_id) || null : null,
        averageRating: stats?.averageRating || 0,
        feedbackCount: stats?.feedbackCount || 0,
      };
    }) || [];

  // Top staff (media più alta)
  const topStaff = [...staffMembers]
    .sort((a, b) => {
      if (Math.abs(a.averageRating - b.averageRating) < 0.01) {
        return b.feedbackCount - a.feedbackCount;
      }
      return b.averageRating - a.averageRating;
    })
    .slice(0, 5);

  // Staff da monitorare (media più bassa)
  const staffToMonitor = [...staffMembers]
    .sort((a, b) => {
      if (Math.abs(a.averageRating - b.averageRating) < 0.01) {
        return b.feedbackCount - a.feedbackCount;
      }
      return a.averageRating - b.averageRating;
    })
    .slice(0, 5);

  // ============================================
  // 4. ISSUES OVERVIEW SECTION
  // ============================================

  const [
    { count: issuesLast7Days },
    { count: unreadIssuesCount },
    { data: recentIssuesData },
  ] = await Promise.all([
    // Issues ultimi 7 giorni (indipendente dal filtro)
    supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structure.id)
      .gte("created_at", sevenDaysAgoISO),
    // Issues non lette (tutte, indipendente dal filtro)
    supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structure.id)
      .eq("is_read", false),
    // Ultime 5 issues
    supabase
      .from("issues")
      .select("id, message, is_read, created_at")
      .eq("structure_id", structure.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentIssues =
    recentIssuesData?.map((issue) => ({
      id: issue.id,
      message: issue.message,
      isRead: issue.is_read,
      createdAt: issue.created_at,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Panoramica delle performance e dello stato del tuo staff
          </p>
        </div>
        <PeriodFilter currentPeriod={periodParam} />
      </div>

      {/* 1. Usage & Health */}
      <UsageHealthSection
        totalFeedbackInPeriod={totalFeedbackInPeriod || 0}
        feedbackLast7Days={feedbackLast7Days || 0}
      />

      {/* 2. Team Performance */}
      <TeamPerformanceTable
        teams={teamPerformanceRows}
        totalIssuesInPeriod={totalIssuesInPeriod || 0}
      />

      {/* 3. Staff Insights */}
      <StaffInsightsSection topStaff={topStaff} staffToMonitor={staffToMonitor} />

      {/* 4. Issues Overview */}
      <IssuesOverviewSection
        issuesInPeriod={totalIssuesInPeriod || 0}
        issuesLast7Days={issuesLast7Days || 0}
        unreadIssuesCount={unreadIssuesCount || 0}
        recentIssues={recentIssues}
      />
    </div>
  );
}
