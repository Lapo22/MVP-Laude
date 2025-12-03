import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabaseClient";
import { sendIssueEmail } from "@/lib/email";

const MAX_MESSAGE_LENGTH = 140;

export async function POST(request: Request) {
  // Check for env vars first
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: Supabase environment variables are missing." },
      { status: 500 },
    );
  }

  // Check for Resend configuration
  if (!process.env.RESEND_FROM_EMAIL) {
    console.error("[ISSUE_EMAIL] RESEND_FROM_EMAIL environment variable missing");
    return NextResponse.json(
      { success: false, error: "Missing RESEND_FROM_EMAIL environment variable" },
      { status: 500 },
    );
  }

  console.log("[ISSUE_EMAIL] Environment check:", {
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
  });

  try {
    const body = await request.json();
    const {
      structure_id: structureId,
      message,
      room_or_name: roomOrName,
    } = body ?? {};

    if (!structureId || !message) {
      return NextResponse.json(
        { success: false, error: "structure_id and message are required." },
        { status: 400 },
      );
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty." },
        { status: 400 },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Message exceeds the character limit." },
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
        { success: false, error: "Structure not found." },
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
      console.error("[ISSUE_EMAIL_ERROR] Failed to insert issue:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to save issue." },
        { status: 500 },
      );
    }

    // Get notification emails for this structure
    const { data: notificationRows, error: notificationError } = await supabase
      .from("notification_emails")
      .select("email")
      .eq("structure_id", structureId)
      .eq("notify_issues", true);

    if (notificationError) {
      console.error("[ISSUE_EMAIL_ERROR] Error fetching notification emails:", notificationError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch notification emails." },
        { status: 500 },
      );
    }

    const recipients = notificationRows?.map((row) => row.email).filter(Boolean) ?? [];

    console.log(`[ISSUE_EMAIL] structureId=${structureId}, to=[${recipients.join(", ")}], hasFrom=${!!process.env.RESEND_FROM_EMAIL}, hasApiKey=${!!process.env.RESEND_API_KEY}`);

    if (recipients.length === 0) {
      console.warn(`[ISSUE_EMAIL] No notification email configured for structure ${structureId}`);
      return NextResponse.json(
        { success: false, error: "No notification email configured for this structure" },
        { status: 400 },
      );
    }

    // Send emails to all recipients
    const createdAt = insertedIssue?.created_at ?? new Date().toISOString();
    console.log(`[ISSUE_EMAIL] Sending emails to ${recipients.length} recipient(s)...`);

    const emailResults = await Promise.allSettled(
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

    // Check if any email failed
    const failedEmails = emailResults.filter(
      (result) => result.status === "rejected" || (result.status === "fulfilled" && !result.value.success)
    );

    if (failedEmails.length > 0) {
      console.error(`[ISSUE_EMAIL_ERROR] Failed to send ${failedEmails.length} out of ${recipients.length} email(s)`);
      failedEmails.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[ISSUE_EMAIL_ERROR] Email ${index} rejected:`, result.reason);
        } else if (result.status === "fulfilled") {
          console.error(`[ISSUE_EMAIL_ERROR] Email ${index} failed:`, result.value.error);
        }
      });

      return NextResponse.json(
        { success: false, error: "EMAIL_SEND_FAILED" },
        { status: 500 },
      );
    }

    console.log(`[ISSUE_EMAIL] Successfully sent ${recipients.length} email(s)`);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ISSUE_EMAIL_ERROR] Unexpected error:", errorMessage);
    
    if (error instanceof Error && error.stack) {
      console.error("[ISSUE_EMAIL_ERROR] Stack:", error.stack);
    }

    return NextResponse.json(
      { success: false, error: "Failed to send issue." },
      { status: 500 },
    );
  }
}
