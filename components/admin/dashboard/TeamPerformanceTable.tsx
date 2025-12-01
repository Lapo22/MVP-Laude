type TeamPerformanceRow = {
  teamId: string;
  teamName: string;
  averageRating: number | null;
  feedbackCount: number;
  lastFeedbackAt: string | null;
};

type TeamPerformanceTableProps = {
  teams: TeamPerformanceRow[];
  totalIssuesInPeriod: number;
};

const TeamPerformanceTable = ({
  teams,
  totalIssuesInPeriod,
}: TeamPerformanceTableProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "–";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Performance dei team</h3>
          <p className="mt-1 text-sm text-gray-500">Analisi delle performance per reparto</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Segnalazioni nel periodo</p>
          <p className="text-lg font-semibold text-gray-900">{totalIssuesInPeriod}</p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">
            Nessun dato disponibile nel periodo selezionato.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Team
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Media
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  # Feedback
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ultimo feedback
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.map((team) => (
                <tr key={team.teamId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 text-sm font-medium text-gray-900">{team.teamName}</td>
                  <td className="py-2.5 text-sm text-gray-700">
                    {team.averageRating !== null ? (
                      <span className="font-medium">{team.averageRating.toFixed(1)} / 3</span>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </td>
                  <td className="py-2.5 text-sm text-gray-700">{team.feedbackCount}</td>
                  <td className="py-2.5 text-sm text-gray-600">{formatDate(team.lastFeedbackAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamPerformanceTable;
