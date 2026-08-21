import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center">
      <p className="text-zinc-400">Select a note or create a new one</p>
    </main>
  );
}
