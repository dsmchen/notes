import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold">Notes</h1>
        <div className="flex items-center gap-4">
          <a
            href="/change-password"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Change password
          </a>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-400">Select a note or create a new one</p>
      </main>
    </div>
  );
}
