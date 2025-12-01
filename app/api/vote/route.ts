import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabaseClient";

const ALLOWED_RATINGS = new Set([1, 2, 3]);

export async function POST(request: Request) {
  // Check for env vars first
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: Supabase environment variables are missing." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    console.log("[vote] Received request body:", JSON.stringify(body, null, 2));
    
    const {
      structure_id: structureId,
      team_id: teamId,
      employee_id: employeeId,
      rating,
    } = body ?? {};

    if (!structureId) {
      console.error("[vote] Missing structure_id");
      return NextResponse.json(
        { error: "structure_id is required." },
        { status: 400 },
      );
    }

    const hasTeam = Boolean(teamId);
    const hasEmployee = Boolean(employeeId);

    console.log("[vote] Validation:", { structureId, hasTeam, teamId, hasEmployee, employeeId, rating });

    if ((!hasTeam && !hasEmployee) || (hasTeam && hasEmployee)) {
      console.error("[vote] Invalid team/employee combination:", { hasTeam, hasEmployee });
      return NextResponse.json(
        { error: "Provide either team_id or employee_id (exclusively)." },
        { status: 400 },
      );
    }

    if (!ALLOWED_RATINGS.has(rating)) {
      console.error("[vote] Invalid rating:", rating);
      return NextResponse.json(
        { error: "Rating must be 1, 2, or 3." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient({
      cookieStore,
      canSetCookies: true,
    });

    const insertData = {
      structure_id: structureId,
      team_id: hasTeam ? teamId : null,
      employee_id: hasEmployee ? employeeId : null,
      rating,
    };

    console.log("[vote] Inserting vote:", JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase.from("votes").insert(insertData).select();

    if (error) {
      console.error("[vote] Supabase error:", error);
      return NextResponse.json(
        { error: `Failed to save vote: ${error.message}` },
        { status: 500 },
      );
    }

    console.log("[vote] Vote saved successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[vote] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save vote." },
      { status: 500 },
    );
  }
}

