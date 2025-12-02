"use client";

import { useState } from "react";

export type RatingValue = 1 | 2 | 3;

type RatingFacesProps = {
  ariaLabel: string;
  currentSelection: RatingValue | null;
  disabled?: boolean;
  onSelect: (value: RatingValue | null) => void;
  size?: "sm" | "md" | "lg";
};

const ratingOptions: Array<{
  value: RatingValue;
  label: string;
  icon: string;
  description: string;
}> = [
  { value: 1, label: "Okay", icon: "😐", description: "Okay" },
  { value: 2, label: "Good", icon: "🙂", description: "Good" },
  { value: 3, label: "Excellent", icon: "😊", description: "Excellent" },
];

const RatingFaces = ({
  ariaLabel,
  currentSelection,
  disabled = false,
  onSelect,
  size = "md",
}: RatingFacesProps) => {
  const [pressed, setPressed] = useState<RatingValue | null>(null);

  const handleClick = (value: RatingValue) => {
    if (disabled) return;
    setPressed(value);
    // Toggle: if already selected, deselect it (pass null)
    if (currentSelection === value) {
      onSelect(null);
    } else {
      onSelect(value);
    }
    setTimeout(() => setPressed(null), 150);
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-base",
    md: "px-4 py-2.5 text-xl",
    lg: "px-5 py-3 text-2xl",
  };

  const iconSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2 md:gap-3" role="group" aria-label={ariaLabel}>
      {ratingOptions.map((option) => {
        const isSelected = currentSelection === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-label={`${ariaLabel}: ${option.label} (${option.value} out of 3)`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleClick(option.value)}
            className={`inline-flex flex-col items-center gap-1.5 rounded-xl border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
              sizeClasses[size]
            } ${
              disabled
                ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                : isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 active:scale-95"
            } ${pressed === option.value ? "scale-90" : ""}`}
          >
            <span className={iconSizeClasses[size]} role="img" aria-hidden="true">
              {option.icon}
            </span>
            <span className="text-xs font-medium md:text-sm">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingFaces;
