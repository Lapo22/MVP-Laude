import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { teamId, name, role } = await request.json();

  if (!teamId || !name || !role) {
    return NextResponse.json(
      { error: "Team, nome e ruolo sono obbligatori." },
      { status: 400 },
    );
  }

  const {
    data: team,
    error: teamError,
  } = await supabase
    .from("teams")
    .select("id, structure_id")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError || !team || team.structure_id !== structure.id) {
    return NextResponse.json(
      { error: "Il team selezionato non è valido." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("employees").insert({
    team_id: teamId,
    structure_id: structure.id,
    name: name.trim(),
    role: role.trim(),
    is_active: true,
  });

  if (error) {
    console.error("[POST /admin/employees]", error);
    return NextResponse.json(
      { error: "Impossibile creare il dipendente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

