"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { Structure } from "@/types";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Team & Dipendenti", href: "/admin/team", icon: "👥" },
  { label: "Segnalazioni", href: "/admin/segnalazioni", icon: "📝" },
  { label: "Notifiche", href: "/admin/notifiche", icon: "🔔" },
];

type SidebarProps = {
  structure: Structure | null;
  user: User;
  signOutAction: () => Promise<void>;
};

const Sidebar = ({ structure, user, signOutAction }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-sm lg:hidden"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform border-r border-gray-100 bg-white shadow-lg transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          {/* Logo / Brand */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <span className="text-lg font-bold">N</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Namely</p>
                <p className="text-xs text-gray-500">Area manager</p>
              </div>
            </div>
            {structure && (
              <p className="mt-4 text-sm text-gray-600">
                <span className="font-medium text-gray-900">{structure.name}</span>
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="mt-auto border-t border-gray-100 pt-4">
            <div className="mb-3 px-3">
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

