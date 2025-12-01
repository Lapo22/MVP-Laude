import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function GET() {
  const { structure } = await requireManagerContext();
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient({
    cookieStore,
    canSetCookies: true,
  });

  const { data, error } = await supabase
    .from("issues")
    .select("id, message, room_or_name, is_read, created_at")
    .eq("structure_id", structure.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /admin/issues]", error);
    return NextResponse.json(
      { error: "Impossibile caricare le segnalazioni." },
      { status: 500 },
    );
  }

  const issues = (data ?? []).map((issue) => ({
    id: issue.id,
    message: issue.message,
    guestInfo: issue.room_or_name,
    isRead: issue.is_read,
    createdAt: issue.created_at,
  }));

  return NextResponse.json({ issues });
}

