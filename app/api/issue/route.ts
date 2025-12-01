import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabaseClient";
import { sendIssueEmail } from "@/lib/email";

const MAX_MESSAGE_LENGTH = 140;

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
    const {
      structure_id: structureId,
      message,
      room_or_name: roomOrName,
    } = body ?? {};

    if (!structureId || !message) {
      return NextResponse.json(
        { error: "structure_id and message are required." },
        { status: 400 },
      );
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Message exceeds the character limit." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = await createSupabaseServerClient({
      cookieStore,
      canSetCookies: true,
    });

    const [{ data: structure, error: structureError }] = await Promise.all([
      supabase
        .from("structures")
        .select("id, name")
        .eq("id", structureId)
        .maybeSingle(),
    ]);

    if (structureError || !structure) {
      return NextResponse.json(
        { error: "Structure not found." },
        { status: 404 },
      );
    }

    const {
      data: insertedIssue,
      error: insertError,
    } = await supabase
      .from("issues")
      .insert({
        structure_id: structureId,
        message: message.trim(),
        room_or_name: roomOrName ?? null,
        is_read: false,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      throw insertError;
    }

    const { data: notificationRows, error: notificationError } = await supabase
      .from("notification_emails")
      .select("email")
      .eq("structure_id", structureId)
      .eq("notify_issues", true);

    if (notificationError) {
      console.error("[issue] Errore nel recupero delle email di notifica:", notificationError);
    }

    const recipients = notificationRows?.map((row) => row.email).filter(Boolean) ?? [];

    console.log(`[issue] Trovate ${recipients.length} email di notifica per la struttura ${structure.id}:`, recipients);

    if (!recipients.length) {
      console.info(
        `[issue] Nessuna email di notifica configurata per la struttura ${structure.id}.`,
      );
    } else {
      const createdAt = insertedIssue?.created_at ?? new Date().toISOString();
      console.log(`[issue] Invio email a ${recipients.length} destinatari...`);
      try {
        await Promise.all(
          recipients.map((recipient) =>
            sendIssueEmail({
              to: recipient,
              structureName: structure.name,
              message: message.trim(),
              guestInfo: roomOrName ?? null,
              createdAt,
            }),
          ),
        );
        console.log(`[issue] Email inviate con successo a ${recipients.length} destinatari.`);
      } catch (emailError) {
        console.error("[issue] Errore durante l'invio delle email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Issue creation error:", error);
    return NextResponse.json(
      { error: "Failed to send issue." },
      { status: 500 },
    );
  }
}

