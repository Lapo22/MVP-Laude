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

  const handleRatingSelect = (entityKey: string, rating: RatingValue | null) => {
    if (isLocked) return;
    setSelections((prev) => {
      if (rating === null) {
        // Deselect: remove the entry
        const newSelections = { ...prev };
        delete newSelections[entityKey];
        return newSelections;
      }
      // Set the new rating
      return { ...prev, [entityKey]: rating };
    });
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
        const firstHyphenIndex = entityKey.indexOf("-");
        if (firstHyphenIndex === -1 || firstHyphenIndex === 0) {
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
          throw new Error(`Invalid entity type: ${type}`);
        }

        const response = await fetch("/api/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = "Failed to save vote";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const text = await response.text().catch(() => "");
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      });

      await Promise.all(votePromises);

      activateCooldown();
      setSelections({});
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedRatings = Object.keys(selections).length > 0;
  const submitDisabled = isLocked || isSubmitting || !hasSelectedRatings;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8 lg:py-10">
        {/* Header */}
        <header className="mb-8 space-y-3 text-center md:mb-10">
          <div className="flex justify-center">
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              {structure.name}
            </h1>
          </div>
          <p className="mx-auto max-w-md text-sm text-gray-600 md:text-base">
            Help us reward the people who made your stay better.
          </p>
        </header>

        {/* Cooldown Banner */}
        {isLocked && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center text-sm text-blue-700">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You have already sent feedback recently. You can vote again later.</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Thank you! Your feedback has been submitted.</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Voting Section */}
        <section className="mx-auto mb-8 max-w-2xl space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 md:text-base">
              Rate the teams and people who made your stay better. Your feedback is anonymous.
            </p>
          </div>

          {teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              No active teams found for this structure.
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  structureId={structure.id}
                  disabled={isLocked || showSuccessMessage}
                  selections={selections}
                  onRatingSelect={handleRatingSelect}
                />
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmitFeedback}
              disabled={submitDisabled}
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-600"
            >
              {isSubmitting ? "Sending your feedback…" : "Submit feedback"}
            </button>
          </div>
        </section>

        {/* Something Wrong Section */}
        <section className="mx-auto max-w-2xl">
          <IssueForm structureId={structure.id} structureName={structure.name} />
        </section>
      </div>
    </div>
  );
};

export default PublicStructureExperience;
