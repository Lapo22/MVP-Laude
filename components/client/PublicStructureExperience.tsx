"use client";

import { useEffect, useState } from "react";

import TeamCard from "./TeamCard";
import IssueForm from "./IssueForm";
import type { Structure } from "@/types";
import type { TeamWithEmployees } from "./types";
import type { RatingValue } from "./RatingFaces";

type PublicStructureExperienceProps = {
  structure: Structure;
  teams: TeamWithEmployees[];
};

const ONE_HOUR_MS = 60 * 60 * 1000;

type SelectionMap = Record<string, RatingValue>;

const useFeedbackCooldown = (slug: string) => {
  const storageKey = `staffFeedbackCooldown_${slug}`;
  const [isLocked, setIsLocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    
    const evaluate = () => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setIsLocked(false);
        return;
      }

      const elapsed = Date.now() - new Date(stored).getTime();
      if (elapsed < ONE_HOUR_MS) {
        setIsLocked(true);
      } else {
        localStorage.removeItem(storageKey);
        setIsLocked(false);
      }
    };

    evaluate();
    const interval = setInterval(evaluate, 30_000);
    return () => clearInterval(interval);
  }, [storageKey]);

  const activateCooldown = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, new Date().toISOString());
    setIsLocked(true);
  };

  return { isLocked: mounted ? isLocked : false, activateCooldown };
};

const PublicStructureExperience = ({
  structure,
  teams,
}: PublicStructureExperienceProps) => {
  const [selections, setSelections] = useState<SelectionMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { isLocked, activateCooldown } = useFeedbackCooldown(structure.slug);

  const handleRatingSelect = (entityKey: string, rating: RatingValue) => {
    if (isLocked) return;
    setSelections((prev) => ({ ...prev, [entityKey]: rating }));
    setError(null);
  };

  const handleSubmitFeedback = async () => {
    if (isLocked || isSubmitting) return;

    const selectedVotes = Object.entries(selections).filter(([_, rating]) => rating !== null);
    
    if (selectedVotes.length === 0) {
      setError("Please select at least one rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setShowSuccessMessage(false);

    try {
      const votePromises = selectedVotes.map(async ([entityKey, rating]) => {
        // Extract type and ID: entityKey format is "team-<uuid>" or "employee-<uuid>"
        // We need to split only on the first hyphen to preserve UUIDs with hyphens
        const firstHyphenIndex = entityKey.indexOf("-");
        if (firstHyphenIndex === -1 || firstHyphenIndex === 0) {
          console.error("Invalid entityKey format:", entityKey);
          throw new Error(`Invalid vote key: ${entityKey}`);
        }

        const type = entityKey.substring(0, firstHyphenIndex);
        const id = entityKey.substring(firstHyphenIndex + 1);
        const payload: {
          structure_id: string;
          team_id?: string | null;
          employee_id?: string | null;
          rating: RatingValue;
        } = {
          structure_id: structure.id,
          rating,
        };

        if (type === "team") {
          payload.team_id = id;
          payload.employee_id = null;
        } else if (type === "employee") {
          payload.employee_id = id;
          payload.team_id = null;
        } else {
          console.error("Unknown entity type:", type, "from entityKey:", entityKey);
          throw new Error(`Invalid entity type: ${type}`);
        }

        console.log("Sending vote payload:", JSON.stringify(payload, null, 2));

        const response = await fetch("/api/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("Vote API response status:", response.status, response.statusText);

        if (!response.ok) {
          let errorMessage = "Failed to save vote";
          try {
            const errorData = await response.json();
            console.error("Vote API error response:", errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            const text = await response.text().catch(() => "");
            console.error("Failed to parse error response. Status:", response.status, "Text:", text);
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Vote API success:", result);
        return result;
      });

      await Promise.all(votePromises);

      activateCooldown();
      setSelections({});
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (err) {
      console.error("Submit feedback error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedRatings = Object.keys(selections).length > 0;
  const submitDisabled = isLocked || isSubmitting || !hasSelectedRatings;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
      {/* Hero / Intro */}
      <header className="mx-auto mb-8 max-w-xl space-y-4 text-center">
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Guest feedback
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
          Rate our staff
        </h1>
        <p className="mx-auto text-sm text-gray-600 md:text-base">
          Help us improve your experience in just a few seconds.
        </p>
        <p className="mx-auto text-xs text-gray-500 md:text-sm">
          Your feedback is anonymous and will only be used to improve our service.
        </p>
      </header>

      {/* Separator */}
      <div className="mx-auto mb-6 max-w-xl border-b border-gray-200" />

      {/* Messaggi di stato */}
      {showSuccessMessage ? (
        <div className="mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Thank you for your feedback!</span>
        </div>
      ) : null}

      {isLocked ? (
        <div className="mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>You have recently submitted your feedback. Thank you for helping us improve!</span>
        </div>
      ) : null}

      {error ? (
        <div className="mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Sezione Team & Dipendenti */}
      <section className="mx-auto mb-6 max-w-xl space-y-4">
        {teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No active teams found for this structure.
          </div>
        ) : (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              structureId={structure.id}
              disabled={isLocked}
              selections={selections}
              onRatingSelect={handleRatingSelect}
            />
          ))
        )}
      </section>

      {/* Pulsante Submit Feedback */}
      <div className="mx-auto mb-8 max-w-xl">
        <button
          type="button"
          onClick={handleSubmitFeedback}
          disabled={submitDisabled}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit feedback"}
        </button>
      </div>

      {/* Sezione "Something not right?" */}
      <section className="mx-auto mt-6 max-w-xl md:mt-8">
        <IssueForm structureId={structure.id} structureName={structure.name} />
      </section>
    </div>
  );
};

export default PublicStructureExperience;
