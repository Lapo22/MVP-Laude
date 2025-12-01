"use client";

type TopEmployeeCardProps = {
  employeeName: string | null;
  employeeRole: string | null;
  teamName: string | null;
  avgRating: number | null;
  voteCount: number;
};

const TopEmployeeCard = ({
  employeeName,
  employeeRole,
  teamName,
  avgRating,
  voteCount,
}: TopEmployeeCardProps) => {
  if (!employeeName || avgRating === null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Miglior dipendente</h3>
        <p className="mt-3 text-sm text-gray-500">
          Nessun dato per i dipendenti negli ultimi 30 giorni.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Miglior dipendente</h3>
      <div className="mt-4 space-y-2">
        <div>
          <p className="text-xl font-medium text-gray-900">{employeeName}</p>
          <p className="text-sm text-gray-600">{employeeRole}</p>
          {teamName && <p className="text-xs text-gray-500">Team: {teamName}</p>}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Media: <span className="font-semibold text-gray-900">{avgRating.toFixed(1)} / 3</span>
          </span>
          <span>
            Voti: <span className="font-semibold text-gray-900">{voteCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopEmployeeCard;

