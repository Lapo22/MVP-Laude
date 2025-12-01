import type { Employee, Team } from "@/types";

export type VotePayload = {
  structureId: string;
  teamId?: string;
  employeeId?: string;
  rating: 1 | 2 | 3;
};

export type TeamWithEmployees = Team & {
  employees: Employee[];
};

