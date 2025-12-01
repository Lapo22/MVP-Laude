"use client";

import { format } from "date-fns";
import { it } from "date-fns/locale";

import type { AdminIssue } from "./types";

type IssueModalProps = {
  issue: AdminIssue | null;
  onClose: () => void;
  onToggleRead: (issue: AdminIssue) => void;
};

const IssueModal = ({ issue, onClose, onToggleRead }: IssueModalProps) => {
  if (!issue) return null;

  const formattedDate = format(new Date(issue.createdAt), "dd/MM/yyyy, HH:mm", { locale: it });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dettagli segnalazione</h3>
            <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Chiudi"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stato</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  issue.isRead
                    ? "bg-gray-100 text-gray-600 border border-gray-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {issue.isRead ? "Letta" : "Non letta"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Messaggio</p>
            <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{issue.message}</p>
          </div>

          {issue.guestInfo && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Info ospite
              </p>
              <p className="mt-2 text-sm text-gray-700">{issue.guestInfo}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => onToggleRead(issue)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
          >
            {issue.isRead ? "Segna come non letta" : "Segna come letta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
