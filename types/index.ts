export type UUID = string;

export type Structure = {
  id: UUID;
  name: string;
  slug: string;
  created_at: string;
};

export type Manager = {
  id: UUID;
  auth_user_id: UUID;
  structure_id: UUID;
  created_at: string;
};

export type Team = {
  id: UUID;
  structure_id: UUID;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Employee = {
  id: UUID;
  structure_id: UUID;
  team_id: UUID;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type Vote = {
  id: UUID;
  structure_id: UUID;
  team_id: UUID | null;
  employee_id: UUID | null;
  rating: 1 | 2 | 3;
  created_at: string;
};

export type Issue = {
  id: UUID;
  structure_id: UUID;
  message: string;
  room_or_name: string | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationEmail = {
  id: UUID;
  structure_id: UUID;
  email: string;
  notify_issues: boolean;
  created_at: string;
};

