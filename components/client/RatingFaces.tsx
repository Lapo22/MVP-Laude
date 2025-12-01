"use client";

import { useState } from "react";

export type RatingValue = 1 | 2 | 3;

type RatingFacesProps = {
  ariaLabel: string;
  currentSelection: RatingValue | null;
  disabled?: boolean;
  onSelect: (value: RatingValue) => void;
  size?: "sm" | "md";
};

const ratingOptions: Array<{
  value: RatingValue;
  label: string;
  icon: string;
}> = [
  { value: 1, label: "Okay", icon: "😐" },
  { value: 2, label: "Good", icon: "🙂" },
  { value: 3, label: "Excellent", icon: "😊" },
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
    onSelect(value);
    setTimeout(() => setPressed(null), 150);
  };

  return (
    <div className="flex items-center gap-2">
      {ratingOptions.map((option) => {
        const isSelected = currentSelection === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-label={`${ariaLabel}: ${option.label}`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleClick(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              disabled
                ? "cursor-not-allowed border-gray-300 bg-white text-gray-400 opacity-60"
                : isSelected
                  ? "border-blue-600 bg-blue-50 font-medium text-blue-700 shadow-sm"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            } ${pressed === option.value ? "scale-95" : ""}`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingFaces;
