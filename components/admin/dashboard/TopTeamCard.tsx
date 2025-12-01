"use client";

type TopTeamCardProps = {
  teamName: string | null;
  avgRating: number | null;
  voteCount: number;
};

const TopTeamCard = ({ teamName, avgRating, voteCount }: TopTeamCardProps) => {
  if (!teamName || avgRating === null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Miglior team</h3>
        <p className="mt-3 text-sm text-gray-500">
          Non ci sono ancora abbastanza dati per i team.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Miglior team</h3>
      <div className="mt-4 space-y-2">
        <p className="text-xl font-medium text-gray-900">{teamName}</p>
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

export default TopTeamCard;

