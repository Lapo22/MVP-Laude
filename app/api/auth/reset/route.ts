import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Inserisci la tua email per reimpostare la password." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient({
      cookieStore,
      canSetCookies: true,
    });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
    });

    if (error) {
      console.error("[auth/reset] resetPasswordForEmail", error);
      return NextResponse.json(
        { error: "Impossibile inviare l'email di reset." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ti abbiamo inviato un'email per reimpostare la password.",
    });
  } catch (error) {
    console.error("[auth/reset] Unexpected error", error);
    return NextResponse.json(
      { error: "Si è verificato un errore imprevisto." },
      { status: 500 },
    );
  }
}

