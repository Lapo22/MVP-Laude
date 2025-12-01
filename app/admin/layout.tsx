import { redirect } from "next/navigation";

import { requireManagerContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseClient";
import Sidebar from "@/components/admin/layout/Sidebar";

const signOutAction = async () => {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
};

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireManagerContext();
  const { structure, user } = session;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="flex min-h-screen">
        <Sidebar structure={structure} user={user} signOutAction={signOutAction} />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
