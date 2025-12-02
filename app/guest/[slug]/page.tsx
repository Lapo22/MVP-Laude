import PublicStructureExperience from "@/components/client/PublicStructureExperience";
import type { Employee, Structure, Team } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

// Force dynamic rendering to ensure Vercel routes this correctly
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
      error:
        "Configuration error: Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
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
      error: error instanceof Error ? error.message : "Failed to load structure data.",
    };
  }
};

const StateCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4 py-16">
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-3 text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default async function StructurePage({ params }: { params: Params }) {
  const { slug } = await params;

  try {
    const { structure, teams, error } = await loadStructureData(slug);

    if (error) {
      return (
        <StateCard
          title="We're sorry"
          description="An error occurred while loading this page."
        />
      );
    }

    if (!structure) {
      return (
        <StateCard
          title="Structure not found"
          description="This link is not associated with an active structure."
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <PublicStructureExperience structure={structure} teams={teams} />
      </div>
    );
  } catch {
    return (
      <StateCard
        title="We're sorry"
        description="An error occurred while loading this page."
      />
    );
  }
}
