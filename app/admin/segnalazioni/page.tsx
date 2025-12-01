import IssueDashboard from "@/components/admin/issues/IssueDashboard";
import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import type { AdminIssue, AdminNotificationEmail } from "@/components/admin/issues/types";

export default async function AdminSegnalazioniPage() {
  const { structure } = await requireManagerContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: issueRows, error: issueError }, { data: notificationRows, error: notificationError }] = await Promise.all([
    supabase
      .from("issues")
      .select("id, message, room_or_name, is_read, created_at")
      .eq("structure_id", structure.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notification_emails")
      .select("id, email, notify_issues")
      .eq("structure_id", structure.id)
      .eq("notify_issues", true)
      .order("created_at", { ascending: true }),
  ]);

  if (issueError) {
    throw new Error(`Impossibile caricare le segnalazioni: ${issueError.message}`);
  }
  if (notificationError) {
    throw new Error(`Impossibile caricare le email di notifica: ${notificationError.message}`);
  }

  const issues: AdminIssue[] =
    issueRows?.map((issue) => ({
      id: issue.id,
      message: issue.message,
      guestInfo: issue.room_or_name,
      isRead: issue.is_read,
      createdAt: issue.created_at,
    })) ?? [];

  const emails: AdminNotificationEmail[] =
    notificationRows?.map((row) => ({
      id: row.id,
      email: row.email,
      notifyIssues: row.notify_issues,
    })) ?? [];

  return <IssueDashboard initialIssues={issues} initialEmails={emails} />;
}

