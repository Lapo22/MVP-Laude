import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  try {
    const { structure } = await requireManagerContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "type e id sono obbligatori." },
        { status: 400 },
      );
    }

    if (type !== "team" && type !== "employee") {
      return NextResponse.json(
        { error: "type deve essere 'team' o 'employee'." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient({
      cookieStore,
      canSetCookies: false,
    });

    // Verifica che il team/dipendente appartenga alla struttura
    if (type === "team") {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("id", id)
        .eq("structure_id", structure.id)
        .maybeSingle();

      if (teamError || !team) {
        return NextResponse.json(
          { error: "Team non trovato o non autorizzato." },
          { status: 404 },
        );
      }
    } else {
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("id", id)
        .eq("structure_id", structure.id)
        .maybeSingle();

      if (employeeError || !employee) {
        return NextResponse.json(
          { error: "Dipendente non trovato o non autorizzato." },
          { status: 404 },
        );
      }
    }

    // Carica i voti
    const votesQuery = supabase
      .from("votes")
      .select("id, rating, created_at, team_id, employee_id")
      .eq("structure_id", structure.id)
      .limit(100)
      .order("created_at", { ascending: false });

    if (type === "team") {
      votesQuery.eq("team_id", id);
    } else {
      votesQuery.eq("employee_id", id);
    }

    const { data: votes, error: votesError } = await votesQuery;

    if (votesError) {
      console.error("[votes/detail] Errore nel caricamento dei voti:", votesError);
      return NextResponse.json(
        { error: "Impossibile caricare i voti." },
        { status: 500 },
      );
    }

    const formattedVotes =
      votes?.map((vote) => ({
        id: vote.id,
        rating: vote.rating,
        created_at: vote.created_at,
        type: vote.team_id ? "team" : "employee",
      })) || [];

    return NextResponse.json({ votes: formattedVotes });
  } catch (error) {
    console.error("[votes/detail] Errore generale:", error);
    return NextResponse.json(
      { error: "Si è verificato un errore." },
      { status: 500 },
    );
  }
}

