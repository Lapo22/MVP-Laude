"use client";

import { useState } from "react";
import Toast from "./Toast";

type IssueFormProps = {
  structureId: string;
  structureName: string;
};

const MAX_MESSAGE_LENGTH = 200;

const IssueForm = ({ structureId, structureName }: IssueFormProps) => {
  const [message, setMessage] = useState("");
  const [roomOrName, setRoomOrName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      setStatus("error");
      setError("Please write a short description before sending.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("idle");
      setError(null);

      const response = await fetch("/api/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structure_id: structureId,
          message: message.trim(),
          room_or_name: roomOrName.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong while sending your message. Please try again.");
      }

      setMessage("");
      setRoomOrName("");
      setStatus("success");
      setShowToast(true);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Thank you — we'll take care of this immediately."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <section className="relative rounded-3xl border border-[#E9E4DA] bg-gradient-to-b from-white to-[#F9F6F1] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.06)] md:p-6">
        <div className="absolute inset-0 rounded-3xl border-[0.5px] border-[#D9C8A0]/50 pointer-events-none"></div>
        
        <div className="relative mb-5 flex items-start gap-2.5">
          <div className="mt-0.5 rounded-full bg-[#F7F4EF] p-2">
            <svg className="h-4 w-4 text-[#C9A15B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="font-serif text-xl font-medium tracking-tight text-[#1F2933] md:text-2xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Something didn't go as expected?
            </h2>
            <p className="text-sm leading-relaxed tracking-wide text-[#6A6A6A] md:text-base">
              Tell us what happened and our team will take care of it right away.
            </p>
          </div>
        </div>

        <form className="relative space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="issue-message" className="block text-sm font-medium tracking-wide text-[#1F2933]">
              Describe the issue
            </label>
            <textarea
              id="issue-message"
              name="message"
              maxLength={MAX_MESSAGE_LENGTH}
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe briefly what happened…"
              className="min-h-[100px] w-full resize-none rounded-xl border border-[#DFD8CC] bg-[#FAF7F1] px-4 py-3 text-sm tracking-wide text-[#1F2933] shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-[#9CA3AF] transition-all focus:border-[#C9A15B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A15B]/20"
              aria-describedby="message-length"
            />
            <div id="message-length" className="flex justify-end text-[10px] text-[#8A8A8A] tracking-wide">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="issue-room" className="block text-sm font-medium tracking-wide text-[#1F2933]">
              Room number or name <span className="text-[#6A6A6A]">(optional)</span>
            </label>
            <input
              id="issue-room"
              name="room_or_name"
              type="text"
              value={roomOrName}
              onChange={(event) => setRoomOrName(event.target.value)}
              placeholder="E.g. Room 215 or John Smith"
              className="w-full rounded-xl border border-[#DFD8CC] bg-[#FAF7F1] px-4 py-2.5 text-sm tracking-wide text-[#1F2933] shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all focus:border-[#C9A15B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A15B]/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full rounded-2xl border border-[#C9A15B]/40 bg-gradient-to-b from-[#0F172A] to-[#1B2436] px-6 py-3.5 text-center text-sm font-medium tracking-wide text-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all duration-200 hover:from-[#152238] hover:to-[#1E293B] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2.5">
              {isSubmitting ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending your message…</span>
                </>
              ) : (
                <>
                  <span>Send report</span>
                  <svg className="h-4 w-4 text-[#C9A15B] transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </span>
          </button>

          {status === "error" && error && (
            <div className="mt-2 text-xs text-[#8A6A5A]">
              {error}
            </div>
          )}
        </form>
      </section>
    </>
  );
};

export default IssueForm;
