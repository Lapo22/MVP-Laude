"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose?: () => void;
};

const Toast = ({ message, type = "success", duration = 2000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 transform transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl ${
          type === "success"
            ? "border-l-4 border-[#C9A15B] bg-[#F7F4EF] text-[#1F2933]"
            : "border-l-4 border-red-400 bg-red-50 text-red-900"
        }`}
      >
        {type === "success" ? (
          <svg className="h-4 w-4 flex-shrink-0 text-[#C9A15B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="text-sm font-medium tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
