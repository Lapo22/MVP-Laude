import Link from "next/link";

type IssuePreview = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type IssuesOverviewSectionProps = {
  issuesInPeriod: number;
  issuesLast7Days: number;
  unreadIssuesCount: number;
  recentIssues: IssuePreview[];
};

const IssuesOverviewSection = ({
  issuesInPeriod,
  issuesLast7Days,
  unreadIssuesCount,
  recentIssues,
}: IssuesOverviewSectionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateMessage = (message: string, maxLength: number = 80) => {
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Riepilogo segnalazioni</h2>
          <p className="mt-1 text-sm text-gray-500">Segnalazioni recenti degli ospiti</p>
        </div>
        <Link
          href="/admin/segnalazioni"
          className="text-sm font-medium text-[#0F172A] hover:text-[#1B2436] transition-colors"
        >
          Vedi tutte →
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Nel periodo</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{issuesInPeriod}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ultimi 7 giorni</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{issuesLast7Days}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Non lette</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{unreadIssuesCount}</p>
        </div>
      </div>

      {recentIssues.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">Nessuna segnalazione recente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Più recenti</p>
          <ul className="space-y-2">
            {recentIssues.map((issue) => (
              <li
                key={issue.id}
                className={`flex items-start justify-between gap-3 rounded-xl border p-3 transition-colors ${
                  !issue.isRead
                    ? "border-red-200 bg-red-50/50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                    {!issue.isRead && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        Non letta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{truncateMessage(issue.message)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IssuesOverviewSection;
