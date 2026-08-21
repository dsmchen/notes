import { createClient } from "@/utils/supabase/server";
import UserMenu from "@/components/user-menu";

export default async function NotesHeader() {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <h1 className="text-lg font-semibold">Notes</h1>
      {claims && <UserMenu />}
    </header>
  );
}
