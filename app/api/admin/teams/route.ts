import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

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

const mapTeams = (rows: TeamRow[]) =>
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

export async function GET() {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { data: teamRows, error } = await supabase
    .from("teams")
    .select("id, name, is_active, employees (id, name, role, is_active)")
    .eq("structure_id", structure.id)
    .order("name", { ascending: true })
    .order("name", { referencedTable: "employees", ascending: true });

  if (error) {
    console.error("[GET /admin/teams]", error);
    return NextResponse.json(
      { error: "Impossibile caricare i team." },
      { status: 500 },
    );
  }

  return NextResponse.json({ teams: mapTeams((teamRows ?? []) as TeamRow[]) });
}

export async function POST(request: Request) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { name } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Il nome del team è obbligatorio." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("teams").insert({
    name: name.trim(),
    structure_id: structure.id,
    is_active: true,
  });

  if (error) {
    console.error("[POST /admin/teams]", error);
    return NextResponse.json(
      { error: "Impossibile creare il team." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

