"use client";

export type AdminIssue = {
  id: string;
  message: string;
  guestInfo: string | null;
  isRead: boolean;
  createdAt: string;
};

export type AdminNotificationEmail = {
  id: string;
  email: string;
  notifyIssues: boolean;
};

