"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type VoteDetail = {
  id: string;
  rating: number;
  created_at: string;
  type: "team" | "employee";
};

type VoteDetailModalProps = {
  type: "team" | "employee";
  id: string;
  name: string;
  onClose: () => void;
};

const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 1:
      return "Discreto";
    case 2:
      return "Buono";
    case 3:
      return "Eccellente";
    default:
      return String(rating);
  }
};

const VoteDetailModal = ({ type, id, name, onClose }: VoteDetailModalProps) => {
  const [votes, setVotes] = useState<VoteDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/votes/detail?type=${type}&id=${id}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossibile caricare i dettagli dei voti.");
        }
        setVotes(payload.votes ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Si è verificato un errore.");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [type, id]);

  const totalVotes = votes.length;
  const averageRating =
    votes.length > 0
      ? votes.reduce((sum, vote) => sum + vote.rating, 0) / votes.length
      : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy, HH:mm", { locale: it });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dettaglio voti – {name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {type === "team" ? "Team" : "Dipendente"}
            </p>
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

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">Caricamento...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Totale voti</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{totalVotes}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Media voti</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {averageRating !== null ? averageRating.toFixed(1) : "–"}
                </p>
              </div>
            </div>

            {/* Votes List */}
            {votes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">Nessun voto disponibile.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Data
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Tipo voto
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Valore
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {votes.map((vote) => (
                      <tr key={vote.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 text-sm text-gray-700">{formatDate(vote.created_at)}</td>
                        <td className="py-2.5 text-sm text-gray-700">
                          {vote.type === "team" ? "Team" : "Dipendente"}
                        </td>
                        <td className="py-2.5 text-sm text-gray-700">
                          <span className="font-medium">{getRatingLabel(vote.rating)}</span>
                          <span className="ml-2 text-xs text-gray-500">({vote.rating}/3)</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VoteDetailModal;

