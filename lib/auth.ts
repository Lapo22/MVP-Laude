"use server";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "./supabaseClient";
import type { Manager, Structure } from "@/types";

const LOGIN_ROUTE = "/login";

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.message === "Auth session missing!") {
      return null;
    }
    throw new Error(`Failed to read Supabase session: ${error.message}`);
  }

  return user ?? null;
};

export const requireAuthenticatedUser = async (): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(LOGIN_ROUTE);
  }

  return user;
};

export const getCurrentManager = async (): Promise<{
  user: User;
  manager: Manager;
  structure: Structure;
} | null> => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: manager,
    error: managerError,
  } = await supabase
    .from("managers")
    .select("id, auth_user_id, structure_id, created_at")
    .eq("auth_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log("[auth] Manager lookup", {
    userId: user.id,
    manager,
    managerError: managerError?.message,
  });

  if (managerError) {
    console.error("[auth] Manager query error", managerError);
    return null;
  }

  if (!manager) {
    console.warn("[auth] No manager associated with user", user.id);
    return null;
  }

  const {
    data: structure,
    error: structureError,
  } = await supabase
    .from("structures")
    .select("id, name, slug, created_at")
    .eq("id", manager.structure_id)
    .maybeSingle();

  console.log("[auth] Structure lookup", {
    structureId: manager.structure_id,
    structure,
    structureError: structureError?.message,
  });

  if (structureError) {
    console.error("[auth] Structure query error", structureError);
    return null;
  }

  if (!structure) {
    console.warn("[auth] Structure not found for manager", manager.id);
    return null;
  }

  return {
    user,
    manager: manager as Manager,
    structure: structure as Structure,
  };
};

export const requireManagerContext = async () => {
  const session = await getCurrentManager();
  if (!session) {
    redirect(LOGIN_ROUTE);
  }

  return session;
};

