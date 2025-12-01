import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ issueId: string }> },
) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });
  const { issueId } = await params;

  const {
    data: issue,
    error: issueError,
  } = await supabase
    .from("issues")
    .select("id, structure_id")
    .eq("id", issueId)
    .maybeSingle();

  if (issueError || !issue || issue.structure_id !== structure.id) {
    return NextResponse.json(
      { error: "Segnalazione non trovata." },
      { status: 404 },
    );
  }

  const { isRead } = await request.json();

  if (typeof isRead !== "boolean") {
    return NextResponse.json(
      { error: "Valore isRead mancante o non valido." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("issues")
    .update({ is_read: isRead })
    .eq("id", issueId);

  if (error) {
    console.error("[PATCH /admin/issues/:id]", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare la segnalazione." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

