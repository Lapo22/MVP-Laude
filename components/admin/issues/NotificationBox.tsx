"use client";

import type { AdminNotificationEmail } from "./types";

type NotificationBoxProps = {
  emails: AdminNotificationEmail[];
  newEmail: string;
  onEmailChange: (value: string) => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: AdminNotificationEmail) => void;
  loading: boolean;
};

const NotificationBox = ({
  emails,
  newEmail,
  onEmailChange,
  onAddEmail,
  onRemoveEmail,
  loading,
}: NotificationBoxProps) => {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5 lg:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Email notifiche segnalazioni</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aggiungi gli indirizzi che devono ricevere un avviso quando arriva una nuova segnalazione
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="email"
          value={newEmail}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="esempio@hotel.com"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddEmail();
            }
          }}
        />
        <button
          type="button"
          onClick={onAddEmail}
          disabled={loading || !newEmail.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Aggiungi email
        </button>
      </div>

      {emails.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">Nessuna email configurata.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {emails.map((email) => (
            <li
              key={email.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{email.email}</p>
                {email.notifyIssues && (
                  <p className="mt-0.5 text-xs text-gray-500">Notifiche attive</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveEmail(email)}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
              >
                Elimina
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NotificationBox;
