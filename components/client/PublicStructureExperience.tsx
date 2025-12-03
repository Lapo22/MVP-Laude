"use client";

import { useEffect, useState } from "react";

import TeamCard from "./TeamCard";
import IssueForm from "./IssueForm";
import Toast from "./Toast";
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

// Design tokens - unified spacing and styling
const SPACING = {
  xs: "0.5rem", // 8px
  sm: "0.75rem", // 12px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
};

const PageHeader = ({ structureName }: { structureName: string }) => (
  <header className="mb-8 text-center animate-fade-in md:mb-10">
    <div className="mx-auto mb-3 h-[1.5px] w-10 bg-[#C9A15B]"></div>
    <h1 
      className="mb-3 font-serif text-3xl font-medium tracking-tight text-[#0F172A] md:text-4xl" 
      style={{ 
        fontFamily: 'Georgia, "Times New Roman", serif',
        textShadow: '0 0.3px 0.3px rgba(0,0,0,0.1)'
      }}
    >
      {structureName}
    </h1>
    <div className="mx-auto mb-4 h-[1.5px] w-10 bg-[#C9A15B]"></div>
    <p className="mb-2 text-base leading-relaxed tracking-wide text-[#6A6A6A] md:text-lg">
      We'd love to hear about your experience.
    </p>
    <p className="text-sm leading-relaxed tracking-wide text-[#6A6A6A] md:text-base">
      Your feedback helps us celebrate great service and improve even more.
    </p>
  </header>
);

const InfoBanner = ({ 
  message, 
  variant = "info" 
}: { 
  message: string; 
  variant?: "info" | "error";
}) => (
  <div 
    className={`mb-6 animate-fade-in rounded-3xl border px-4 py-3 text-center text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
      variant === "error"
        ? "border-red-200 bg-red-50/90 text-red-800"
        : "border-[#E9E4DA] bg-white/90 text-[#6A6A6A]"
    }`}
  >
    <span>{message}</span>
  </div>
);

const SubmitButton = ({
  onClick,
  disabled,
  isSubmitting,
  label = "Submit your feedback",
}: {
  onClick: () => void;
  disabled: boolean;
  isSubmitting: boolean;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="group w-full rounded-2xl border border-[#C9A15B]/40 bg-gradient-to-b from-[#0F172A] to-[#1B2436] px-8 py-4 text-base font-medium tracking-wide text-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all duration-200 hover:from-[#152238] hover:to-[#1E293B] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 focus:ring-offset-[#F6F3EE] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)]"
  >
    <span className="flex items-center justify-center gap-2.5">
      {isSubmitting ? (
        <>
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Sending your feedback…</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <svg className="h-4 w-4 text-[#C9A15B] transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </>
      )}
    </span>
  </button>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="animate-fade-in rounded-3xl border border-[#E9E4DA] bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <p className="text-sm text-[#6A6A6A]">{message}</p>
  </div>
);

const PublicStructureExperience = ({
  structure,
  teams,
}: PublicStructureExperienceProps) => {
  const [selections, setSelections] = useState<SelectionMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { isLocked, activateCooldown } = useFeedbackCooldown(structure.slug);

  const handleRatingSelect = (entityKey: string, rating: RatingValue | null) => {
    if (isLocked) return;
    setSelections((prev) => {
      if (rating === null) {
        const newSelections = { ...prev };
        delete newSelections[entityKey];
        return newSelections;
      }
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
    setShowToast(false);

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
      setShowToast(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedRatings = Object.keys(selections).length > 0;
  const submitDisabled = isLocked || isSubmitting || !hasSelectedRatings;

  return (
    <div className="min-h-screen premium-bg">
      {showToast && (
        <Toast
          message="Thank you. Your feedback has been received."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="relative mx-auto w-full max-w-[540px] px-5 py-8 md:px-8 md:py-12">
        <PageHeader structureName={structure.name} />

        {isLocked && (
          <InfoBanner message="You've already submitted feedback recently. You'll be able to rate again later." />
        )}

        {error && (
          <InfoBanner message={error} variant="error" />
        )}

        <section className="mb-8 space-y-4">
          {teams.length === 0 ? (
            <EmptyState message="This property is not yet ready to receive feedback." />
          ) : (
            <div className="space-y-4">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <TeamCard
                    team={team}
                    structureId={structure.id}
                    disabled={isLocked}
                    selections={selections}
                    onRatingSelect={handleRatingSelect}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-4">
            <SubmitButton
              onClick={handleSubmitFeedback}
              disabled={submitDisabled}
              isSubmitting={isSubmitting}
            />
          </div>
        </section>

        <div className="my-8 h-px bg-[#E9E4DA]"></div>

        <section className="animate-fade-in" style={{ animationDelay: `${teams.length * 60 + 100}ms` }}>
          <IssueForm structureId={structure.id} structureName={structure.name} />
        </section>
      </div>
    </div>
  );
};

export default PublicStructureExperience;
