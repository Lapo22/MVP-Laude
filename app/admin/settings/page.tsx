import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import type { AdminNotificationEmail } from "@/components/admin/issues/types";

export default async function AdminSettingsPage() {
  const { structure } = await requireManagerContext();
  const supabase = await createSupabaseServerClient();

  const { data: notificationRows, error: notificationError } = await supabase
    .from("notification_emails")
    .select("id, email, notify_issues")
    .eq("structure_id", structure.id)
    .eq("notify_issues", true)
    .order("created_at", { ascending: true });

  if (notificationError) {
    throw new Error(`Impossibile caricare le email di notifica: ${notificationError.message}`);
  }

  const emails: AdminNotificationEmail[] =
    notificationRows?.map((row) => ({
      id: row.id,
      email: row.email,
      notifyIssues: row.notify_issues,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Impostazioni</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gestisci le impostazioni e le preferenze della tua struttura
        </p>
      </div>

      <NotificationSettings initialEmails={emails} />
    </div>
  );
}
