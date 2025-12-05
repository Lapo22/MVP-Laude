"use client";

import { useMemo, useState } from "react";

import IssueCard from "./IssueCard";
import IssueModal from "./IssueModal";
import NotificationBox from "./NotificationBox";
import type { AdminIssue, AdminNotificationEmail } from "./types";

type IssueDashboardProps = {
  initialIssues: AdminIssue[];
  initialEmails: AdminNotificationEmail[];
};

type IssueFilter = "all" | "unread" | "read";

const IssueDashboard = ({ initialIssues, initialEmails }: IssueDashboardProps) => {
  const [issues, setIssues] = useState<AdminIssue[]>(initialIssues);
  const [emails, setEmails] = useState<AdminNotificationEmail[]>(initialEmails);
  const [filter, setFilter] = useState<IssueFilter>("unread");
  const [selectedIssue, setSelectedIssue] = useState<AdminIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const filteredIssues = useMemo(() => {
    if (filter === "all") return issues;
    if (filter === "unread") return issues.filter((issue) => !issue.isRead);
    return issues.filter((issue) => issue.isRead);
  }, [issues, filter]);

  const refetchIssues = async () => {
    const response = await fetch("/api/admin/issues", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) {
      setIssues(payload.issues ?? []);
      setError(null);
    } else {
      setError(payload.error ?? "Impossibile aggiornare le segnalazioni.");
    }
  };

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

  const handleToggleIssue = async (issue: AdminIssue) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !issue.isRead }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile aggiornare la segnalazione.");
      }
      await refetchIssues();
      if (selectedIssue && selectedIssue.id === issue.id) {
        setSelectedIssue({ ...selectedIssue, isRead: !issue.isRead });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
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
      await refetchEmails();
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
      await refetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {(["all", "unread", "read"] as IssueFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === option
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {option === "all" ? "Tutte" : option === "unread" ? "Non lette" : "Lette"}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Nessuna segnalazione disponibile per il filtro selezionato.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onSelect={setSelectedIssue} onToggleRead={handleToggleIssue} />
          ))
        )}
      </div>

      {/* Notification Emails */}
      <NotificationBox
        emails={emails}
        newEmail={newEmail}
        onEmailChange={setNewEmail}
        onAddEmail={handleAddEmail}
        onRemoveEmail={handleRemoveEmail}
        loading={loading}
      />

      <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} onToggleRead={handleToggleIssue} />
    </div>
  );
};

export default IssueDashboard;
