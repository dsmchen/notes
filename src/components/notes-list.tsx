import { createClient } from "@/utils/supabase/server";

export default async function NotesList() {
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, content, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-zinc-400">No notes yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <nav className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {notes.map((note) => (
        <a
          key={note.id}
          href={`/note/${note.id}`}
          className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <h2 className="truncate text-sm font-medium">
            {note.title || "Untitled"}
          </h2>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {note.content
              ? note.content.slice(0, 100).replace(/[#*_`]/g, "").trim()
              : "Empty note"}
          </p>
          <time className="mt-1 block text-xs text-zinc-400">
            {new Date(note.created_at).toLocaleDateString()}
          </time>
        </a>
      ))}
    </nav>
  );
}
