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

const MIN_FEEDBACK_FOR_STAFF_INSIGHTS = 5;

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
  // 1. KPI CARDS - Calculate average score and other metrics
  // ============================================

  // Get all votes in period for average calculation
  const votesQuery = supabase
    .from("votes")
    .select("rating")
    .eq("structure_id", structure.id);
  if (periodStartDate) {
    votesQuery.gte("created_at", periodStartDate);
  }
  const { data: votes } = await votesQuery;

  const averageScore = votes && votes.length > 0
    ? votes.reduce((sum, vote) => sum + vote.rating, 0) / votes.length
    : null;

  const getScoreLabel = (score: number | null): string => {
    if (score === null) return "Nessun dato";
    if (score >= 2.5) return "Eccellente";
    if (score >= 2.0) return "Molto buono";
    if (score >= 1.5) return "Buono";
    return "Richiede attenzione";
  };

  // Query per totale feedback nel periodo
  const totalFeedbackQuery = supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("structure_id", structure.id);
  if (periodStartDate) {
    totalFeedbackQuery.gte("created_at", periodStartDate);
  }

  // Active teams count
  const { count: activeTeamsCount } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("structure_id", structure.id)
    .eq("is_active", true);

  const [
    { count: totalFeedbackInPeriod },
    { count: feedbackLast7Days },
    { count: totalIssuesInPeriod },
  ] = await Promise.all([
    totalFeedbackQuery,
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structure.id)
      .gte("created_at", sevenDaysAgoISO),
    (() => {
      const issuesQuery = supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("structure_id", structure.id);
      if (periodStartDate) {
        issuesQuery.gte("created_at", periodStartDate);
      }
      return issuesQuery;
    })(),
  ]);

  // ============================================
  // 2. TEAM PERFORMANCE SECTION
  // ============================================

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

  // Sort by average rating (highest first) for top performing teams
  teamPerformanceRows.sort((a, b) => {
    if (a.averageRating === null && b.averageRating === null) return 0;
    if (a.averageRating === null) return 1;
    if (b.averageRating === null) return -1;
    return b.averageRating - a.averageRating;
  });

  // ============================================
  // 3. STAFF INSIGHTS SECTION
  // ============================================

  const employeeVotesQuery = supabase
    .from("votes")
    .select("employee_id, rating")
    .eq("structure_id", structure.id)
    .not("employee_id", "is", null);
  if (periodStartDate) {
    employeeVotesQuery.gte("created_at", periodStartDate);
  }
  const { data: employeeVotes } = await employeeVotesQuery;

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

  const employeesWithEnoughFeedback = Array.from(employeeStatsMap.entries())
    .filter(([_, stats]) => stats.count >= MIN_FEEDBACK_FOR_STAFF_INSIGHTS)
    .map(([employeeId, stats]) => ({
      employeeId,
      averageRating: stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length,
      feedbackCount: stats.count,
    }));

  const employeeIds = employeesWithEnoughFeedback.map((e) => e.employeeId);
  const { data: employeesData } =
    employeeIds.length > 0
      ? await supabase
          .from("employees")
          .select("id, name, role, team_id")
          .eq("structure_id", structure.id)
          .in("id", employeeIds)
      : { data: [] };

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

  const topStaff = [...staffMembers]
    .sort((a, b) => {
      if (Math.abs(a.averageRating - b.averageRating) < 0.01) {
        return b.feedbackCount - a.feedbackCount;
      }
      return b.averageRating - a.averageRating;
    })
    .slice(0, 3);

  const staffToMonitor = [...staffMembers]
    .sort((a, b) => {
      if (Math.abs(a.averageRating - b.averageRating) < 0.01) {
        return b.feedbackCount - a.feedbackCount;
      }
      return a.averageRating - b.averageRating;
    })
    .slice(0, 3);

  // ============================================
  // 4. ISSUES OVERVIEW SECTION
  // ============================================

  const [
    { count: issuesLast7Days },
    { count: unreadIssuesCount },
    { data: recentIssuesData },
  ] = await Promise.all([
    supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structure.id)
      .gte("created_at", sevenDaysAgoISO),
    supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .eq("structure_id", structure.id)
      .eq("is_read", false),
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Panoramica</h1>
        <p className="mt-2 text-lg text-gray-600">{structure.name}</p>
        <p className="mt-1 text-sm text-gray-500">Feedback degli ospiti a colpo d'occhio.</p>
      </div>

      {/* Period Filter */}
      <div className="flex justify-end">
        <PeriodFilter currentPeriod={periodParam} basePath="/admin" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Media voti</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {averageScore !== null ? `${averageScore.toFixed(1)} / 3` : "–"}
          </p>
          <p className="mt-1 text-sm text-gray-600">{getScoreLabel(averageScore)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Totale voti</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalFeedbackInPeriod || 0}</p>
          <p className="mt-1 text-sm text-gray-600">Nel periodo selezionato</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Team attivi</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{activeTeamsCount || 0}</p>
          <p className="mt-1 text-sm text-gray-600">Attualmente attivi</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Segnalazioni</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalIssuesInPeriod || 0}</p>
          <p className="mt-1 text-sm text-gray-600">Nel periodo selezionato</p>
        </div>
      </div>

      {/* Team Performance */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team migliori</h2>
          <p className="mt-1 text-sm text-gray-500">Team classificati per media voti degli ospiti</p>
        </div>
        {teamPerformanceRows.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">Dati insufficienti</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {teamPerformanceRows.slice(0, 3).map((team) => (
                <div
                  key={team.teamId}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{team.teamName}</p>
                    <p className="mt-1 text-sm text-gray-600">{team.feedbackCount} voti</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {team.averageRating !== null ? `${team.averageRating.toFixed(1)} / 3` : "–"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Staff Highlights */}
      <StaffInsightsSection topStaff={topStaff} staffToMonitor={staffToMonitor} />

      {/* Issues Snapshot */}
      <IssuesOverviewSection
        issuesInPeriod={totalIssuesInPeriod || 0}
        issuesLast7Days={issuesLast7Days || 0}
        unreadIssuesCount={unreadIssuesCount || 0}
        recentIssues={recentIssues}
      />
    </div>
  );
}
