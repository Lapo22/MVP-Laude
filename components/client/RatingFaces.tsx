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
  bgColor: string;
  borderColor: string;
  selectedBg: string;
  selectedBorder: string;
}> = [
  {
    value: 1,
    label: "Fair",
    icon: "😐",
    bgColor: "#F5F1E8",
    borderColor: "#D9C8A0",
    selectedBg: "#F5F1E8",
    selectedBorder: "#C9A15B",
  },
  {
    value: 2,
    label: "Good",
    icon: "🙂",
    bgColor: "#F5F1E8",
    borderColor: "#D9C8A0",
    selectedBg: "#F8ECD2",
    selectedBorder: "#C9A15B",
  },
  {
    value: 3,
    label: "Excellent",
    icon: "😊",
    bgColor: "#F5F1E8",
    borderColor: "#D9C8A0",
    selectedBg: "#E8F5DD",
    selectedBorder: "#C9A15B",
  },
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
    
    if (currentSelection === value) {
      onSelect(null);
    } else {
      onSelect(value);
    }
    
    setTimeout(() => setPressed(null), 150);
  };

  // Unified sizing - all chips same dimensions
  const sizeClasses = {
    sm: "h-[44px] w-[75px] px-3 py-2",
    md: "h-[48px] w-[82px] px-3.5 py-2.5",
    lg: "h-[52px] w-[88px] px-4 py-3",
  };

  const iconSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2 md:gap-2.5" role="group" aria-label={ariaLabel}>
      {ratingOptions.map((option) => {
        const isSelected = currentSelection === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            aria-label={`${ariaLabel}: Rate as ${option.label}`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleClick(option.value)}
            className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A] ${
              sizeClasses[size]
            } ${
              disabled
                ? "cursor-not-allowed border-[#D9C8A0] bg-[#F5F1E8] opacity-50"
                : isSelected
                  ? "cursor-pointer shadow-sm"
                  : "cursor-pointer border-[#D9C8A0] bg-[#F5F1E8] hover:bg-[#F8F4ED] hover:shadow-md active:scale-[0.97]"
            } ${pressed === option.value ? "scale-[0.97]" : ""}`}
            style={
              isSelected
                ? {
                    backgroundColor: option.selectedBg,
                    borderColor: option.selectedBorder,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)",
                  }
                : {
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
                  }
            }
          >
            <span
              className={`${iconSizeClasses[size]} flex items-center justify-center`}
              role="img"
              aria-hidden="true"
            >
              {option.icon}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.05em] text-[#1F2933] leading-tight text-center md:text-[10px]">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingFaces;
