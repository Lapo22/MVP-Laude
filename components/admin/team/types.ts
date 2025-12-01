"use client";

export type AdminEmployee = {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  teamId: string;
};

export type AdminTeam = {
  id: string;
  name: string;
  isActive: boolean;
  employees: AdminEmployee[];
};

