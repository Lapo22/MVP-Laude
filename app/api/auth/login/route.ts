import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatorie." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient({
      cookieStore,
      canSetCookies: true,
    });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      console.error("[auth/login] signInWithPassword", error);
      return NextResponse.json(
        { error: "Email o password non corretti." },
        { status: 401 },
      );
    }

    const {
      data: manager,
      error: managerError,
    } = await supabase
      .from("managers")
      .select("id, auth_user_id, structure_id, created_at")
      .eq("auth_user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("[auth/login] Manager lookup", {
      userId: data.user.id,
      manager,
      managerError: managerError?.message,
    });

    if (managerError) {
      console.error("[auth/login] Manager query error", managerError);
      return NextResponse.json(
        { error: "Impossibile verificare il tuo account manager." },
        { status: 500 },
      );
    }

    if (!manager) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Non sei autorizzato ad accedere all’area manager." },
        { status: 403 },
      );
    }

    const {
      data: structure,
      error: structureError,
    } = await supabase
      .from("structures")
      .select("id, name, slug")
      .eq("id", manager.structure_id)
      .maybeSingle();

    console.log("[auth/login] Structure lookup", {
      structureId: manager.structure_id,
      structure,
      structureError: structureError?.message,
    });

    if (structureError) {
      console.error("[auth/login] Structure query error", structureError);
      return NextResponse.json(
        { error: "Impossibile verificare la struttura associata." },
        { status: 500 },
      );
    }

    if (!structure) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Il tuo profilo manager non ha una struttura associata." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Accesso completato per ${structure.name}.`,
    });
  } catch (error) {
    console.error("[auth/login] Unexpected error", error);
    return NextResponse.json(
      { error: "Si è verificato un errore imprevisto." },
      { status: 500 },
    );
  }
}

