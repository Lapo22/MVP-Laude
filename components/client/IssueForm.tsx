"use client";

import { useState } from "react";

type IssueFormProps = {
  structureId: string;
  structureName: string;
};

const MAX_MESSAGE_LENGTH = 140;

const IssueForm = ({ structureId, structureName }: IssueFormProps) => {
  const [message, setMessage] = useState("");
  const [roomOrName, setRoomOrName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          structure_name: structureName,
        }),
      });

      if (!response.ok) {
        throw new Error("We could not send your report. Please try again in a moment.");
      }

      setMessage("");
      setRoomOrName("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm md:p-5">
      <div className="mb-5 space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Something not right?</h2>
        <p className="text-sm text-gray-700">
          Tell us what's wrong so we can help you during your stay.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="issue-message" className="text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="issue-message"
            name="message"
            maxLength={MAX_MESSAGE_LENGTH}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe briefly what happened…"
            className="min-h-[90px] w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex justify-end text-xs text-gray-500">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="issue-room" className="text-sm font-medium text-gray-700">
            Room number or name (optional)
          </label>
          <input
            id="issue-room"
            name="room_or_name"
            type="text"
            value={roomOrName}
            onChange={(event) => setRoomOrName(event.target.value)}
            placeholder="E.g. Room 215 or John Smith"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          {isSubmitting ? "Sending…" : "Send report"}
        </button>

        {status === "success" ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Thank you, we have received your report.</span>
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}
      </form>
    </section>
  );
};

export default IssueForm;
