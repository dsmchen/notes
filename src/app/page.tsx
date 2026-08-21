import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NotesList from "@/components/notes-list";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1">
      <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800">
        <NotesList />
      </aside>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400">Select a note or create a new one</p>
      </main>
    </div>
  );
}
