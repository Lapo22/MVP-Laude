import PublicStructureExperience from "@/components/client/PublicStructureExperience";
import type { Employee, Structure, Team } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

type Params = Promise<{
  slug: string;
}>;

type TeamWithEmployees = Team & {
  employees: Employee[];
};

const loadStructureData = async (
  slug: string,
): Promise<{ structure: Structure | null; teams: TeamWithEmployees[]; error?: string }> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      structure: null,
      teams: [],
      error: "We couldn't load this page. Please try again in a moment.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const [{ data: structure, error: structureError }] = await Promise.all([
      supabase.from("structures").select("*").eq("slug", slug).maybeSingle(),
    ]);

    if (structureError || !structure) {
      return { structure: null, teams: [] };
    }

    const [{ data: teams }, { data: employees }] = await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .eq("structure_id", structure.id)
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("employees")
        .select("*")
        .eq("structure_id", structure.id)
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    const employeesByTeam = (employees ?? []).reduce<Record<string, Employee[]>>((acc, employee) => {
      if (!acc[employee.team_id]) {
        acc[employee.team_id] = [];
      }
      acc[employee.team_id].push(employee);
      return acc;
    }, {});

    const teamsWithEmployees: TeamWithEmployees[] = (teams ?? []).map((team) => ({
      ...team,
      employees: employeesByTeam[team.id] ?? [],
    }));

    return { structure, teams: teamsWithEmployees };
  } catch (error) {
    return {
      structure: null,
      teams: [],
      error: "We couldn't load this page. Please try again in a moment.",
    };
  }
};

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center premium-bg px-4 py-16">
    <div className="w-full max-w-md rounded-3xl border border-[#E9E4DA] bg-white p-8 text-center shadow-[0_4px_15px_rgba(0,0,0,0.06)]">
      <h1 className="mb-3 font-serif text-2xl font-medium text-[#0F172A] md:text-3xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        We're sorry
      </h1>
      <p className="text-sm text-[#6A6A6A]">{message}</p>
    </div>
  </div>
);

export default async function StructurePage({ params }: { params: Params }) {
  const { slug } = await params;

  try {
    const { structure, teams, error } = await loadStructureData(slug);

    if (error) {
      return <ErrorState message={error} />;
    }

    if (!structure) {
      return (
        <ErrorState message="This link is not associated with an active structure." />
      );
    }

    return (
      <PublicStructureExperience structure={structure} teams={teams} />
    );
  } catch {
    return (
      <ErrorState message="An error occurred while loading this page." />
    );
  }
}
