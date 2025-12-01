import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });
  const { employeeId } = await params;

  const {
    data: employee,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select("id, structure_id")
    .eq("id", employeeId)
    .maybeSingle();

  if (employeeError || !employee || employee.structure_id !== structure.id) {
    return NextResponse.json(
      { error: "Dipendente non trovato." },
      { status: 404 },
    );
  }

  const body = await request.json();
  const updates: Partial<{ name: string; role: string; is_active: boolean }> = {};

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.role === "string" && body.role.trim()) {
    updates.role = body.role.trim();
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

  const { error } = await supabase.from("employees").update(updates).eq("id", employeeId);

  if (error) {
    console.error("[PATCH /admin/employees/:id]", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare il dipendente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });
  const { employeeId } = await params;

  const {
    data: employee,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select("id, structure_id")
    .eq("id", employeeId)
    .maybeSingle();

  if (employeeError || !employee || employee.structure_id !== structure.id) {
    return NextResponse.json(
      { error: "Dipendente non trovato." },
      { status: 404 },
    );
  }

  const { error: deleteVotesError } = await supabase.from("votes").delete().eq("employee_id", employeeId);

  if (deleteVotesError) {
    console.error("[DELETE /admin/employees/:id] delete votes", deleteVotesError);
    return NextResponse.json(
      { error: "Impossibile eliminare i voti associati." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("employees").delete().eq("id", employeeId);

  if (error) {
    console.error("[DELETE /admin/employees/:id]", error);
    return NextResponse.json(
      { error: "Impossibile eliminare il dipendente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

