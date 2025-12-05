"use client";

import { useState } from "react";
import type { AdminNotificationEmail } from "@/components/admin/issues/types";

type NotificationSettingsProps = {
  initialEmails: AdminNotificationEmail[];
};

const NotificationSettings = ({ initialEmails }: NotificationSettingsProps) => {
  const [emails, setEmails] = useState<AdminNotificationEmail[]>(initialEmails);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refetchEmails = async () => {
    const response = await fetch("/api/admin/notifications", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) {
      setEmails(payload.emails ?? []);
      setError(null);
    } else {
      setError(payload.error ?? "Impossibile aggiornare le email di notifica.");
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile aggiungere l'email.");
      }
      setNewEmail("");
      setMessage("Email aggiunta con successo.");
      await refetchEmails();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmail = async (email: AdminNotificationEmail) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile rimuovere l'email.");
      }
      setMessage("Email rimossa con successo.");
      await refetchEmails();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Notifiche e avvisi email</h2>
          <p className="mt-1 text-sm text-gray-500">
            Questi indirizzi email riceveranno avvisi in tempo reale quando un ospite invia una segnalazione tramite la pagina QR code.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            placeholder="email@esempio.com"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddEmail();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddEmail}
            disabled={loading || !newEmail.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2436] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aggiungi email
          </button>
        </div>

        {emails.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500">Nessun indirizzo email configurato.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {emails.map((email) => (
              <li
                key={email.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{email.email}</p>
                  {email.notifyIssues && (
                    <p className="mt-0.5 text-xs text-gray-500">Riceve notifiche per le segnalazioni</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
                >
                  Rimuovi
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default NotificationSettings;
