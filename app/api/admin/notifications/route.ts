import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function GET() {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { data, error } = await supabase
    .from("notification_emails")
    .select("id, email, notify_issues")
    .eq("structure_id", structure.id)
    .eq("notify_issues", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[GET /admin/notifications]", error);
    return NextResponse.json(
      { error: "Impossibile caricare le email di notifica." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    emails:
      data?.map((row) => ({
        id: row.id,
        email: row.email,
        notifyIssues: row.notify_issues,
      })) ?? [],
  });
}

export async function POST(request: Request) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { email } = await request.json();

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Inserisci un indirizzo email valido." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("notification_emails").insert({
    structure_id: structure.id,
    email: email.trim(),
    notify_issues: true,
  });

  if (error) {
    console.error("[POST /admin/notifications]", error);
    return NextResponse.json(
      { error: "Impossibile salvare l'indirizzo email." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { id } = await request.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "ID email mancante." },
      { status: 400 },
    );
  }

  const {
    data: row,
    error: fetchError,
  } = await supabase
    .from("notification_emails")
    .select("id, structure_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row || row.structure_id !== structure.id) {
    return NextResponse.json(
      { error: "Email non trovata." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("notification_emails").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /admin/notifications]", error);
    return NextResponse.json(
      { error: "Impossibile eliminare l'indirizzo email." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

