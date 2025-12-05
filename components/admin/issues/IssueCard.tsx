"use client";

import { format } from "date-fns";
import { it } from "date-fns/locale";

import type { AdminIssue } from "./types";

type IssueCardProps = {
  issue: AdminIssue;
  onSelect: (issue: AdminIssue) => void;
  onToggleRead: (issue: AdminIssue) => void;
};

const IssueCard = ({ issue, onSelect, onToggleRead }: IssueCardProps) => {
  const formattedDate = format(new Date(issue.createdAt), "dd MMM yyyy 'alle' HH:mm", { locale: it });

  return (
    <div
      className={`flex cursor-pointer flex-col gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${
        !issue.isRead
          ? "border-red-200 bg-red-50/50"
          : "border-gray-200 bg-white"
      }`}
      onClick={() => onSelect(issue)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(issue);
        }
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                issue.isRead
                  ? "bg-gray-100 text-gray-600 border border-gray-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {issue.isRead ? "Letta" : "Non letta"}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          <p className="text-base font-medium text-gray-900 leading-relaxed">{issue.message}</p>
          {issue.guestInfo && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Camera/Nome:</span> {issue.guestInfo}
            </p>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 sm:flex-shrink-0"
          onClick={(event) => {
            event.stopPropagation();
            onToggleRead(issue);
          }}
        >
          {issue.isRead ? "Segna come non letta" : "Segna come letta"}
        </button>
      </div>
    </div>
  );
};

export default IssueCard;
