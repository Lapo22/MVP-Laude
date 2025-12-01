import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });
  const { teamId } = await params;

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
      { error: "Team non trovato." },
      { status: 404 },
    );
  }

  const body = await request.json();
  const updates: Partial<{ name: string; is_active: boolean }> = {};

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.isActive === "boolean") {
    updates.is_active = body.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Nessuna modifica richiesta." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("teams").update(updates).eq("id", teamId);

  if (error) {
    console.error("[PATCH /admin/teams/:id]", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare il team." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });
  const { teamId } = await params;

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
      { error: "Team non trovato." },
      { status: 404 },
    );
  }

  const { data: employees } = await supabase
    .from("employees")
    .select("id")
    .eq("team_id", teamId);

  const employeeIds = employees?.map((emp) => emp.id) ?? [];

  if (employeeIds.length > 0) {
    const { error: deleteEmployeeVotesError } = await supabase
      .from("votes")
      .delete()
      .in("employee_id", employeeIds);
    if (deleteEmployeeVotesError) {
      console.error("[DELETE /admin/teams/:id] delete employee votes", deleteEmployeeVotesError);
      return NextResponse.json(
        { error: "Impossibile eliminare i voti dei dipendenti." },
        { status: 500 },
      );
    }
  }

  const { error: deleteTeamVotesError } = await supabase
    .from("votes")
    .delete()
    .eq("team_id", teamId);

  if (deleteTeamVotesError) {
    console.error("[DELETE /admin/teams/:id] delete team votes", deleteTeamVotesError);
    return NextResponse.json(
      { error: "Impossibile eliminare i voti del team." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) {
    console.error("[DELETE /admin/teams/:id] delete team", error);
    return NextResponse.json(
      { error: "Impossibile eliminare il team." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

