# Agent

Instructions for the AI agent working on this project.

## General instructions

### Conventions

- Follow existing code style and patterns
- Mimic naming conventions, libraries, and frameworks used in the codebase
- Run lint and typecheck commands after making changes
- Do not add comments to code unless requested

### Workflow

1. Explore the codebase to understand the relevant area and existing patterns
2. Plan the approach — consider trade-offs, security implications, and edge cases before writing code
3. Write tests when applicable
4. Verify with lint and typecheck before finishing

Apply throughout:

- Clean code: meaningful names, small focused functions, DRY, no dead code, no hardcoded secrets
- Accessibility: semantic HTML, keyboard navigation, ARIA labels, color contrast
- Performance: minimize bundle size, optimize queries, lazy load where appropriate
- Security: never commit secrets or API keys, validate and sanitize all user inputs

### Communication

- Be concise
- Reference file paths with line numbers when relevant
- Do not add explanations unless asked

## Personal Notes App with Markdown Support

When asked to create a personal notes app with markdown support using Next.js + Supabase.

### Feature outline

#### What it does

- Users can create, edit, and delete text notes with markdown formatting
- Notes are private to each user (via Supabase auth)
- Real-time sync between devices
- Full-text search across notes
- Recently deleted notes can be recovered (soft delete / trash)

#### Key Supabase features

- `auth` for user login/signup
- `notes` table with columns: `id`, `user_id` (FK to `auth.users`), `title`, `content` (markdown), `created_at`
- Real-time subscriptions for instant updates

#### Next.js implementation

- **Styling**: Tailwind CSS for UI
- **Server Component**: Fetch all notes for current user
- **Client Component**: Rich text editor (e.g., `react-markdown` + `@uiw/react-md-editor`)
- **Auth flow**: Use `@supabase/ssr` for session management
- **Auto-save**: Automatically persist note changes to prevent data loss

#### Nice to have

- Add image uploads to notes (using Supabase Storage)
- Implement note categories with a `tags` table
- Pin important notes to the top of the list
- Dark mode support
- Add export to PDF functionality

### Build steps

1. **Scaffold project** — `create-next-app` with TypeScript and Tailwind CSS, install `@supabase/supabase-js`, `@supabase/ssr`, `react-markdown`, and `@uiw/react-md-editor`
2. **Set up Supabase** — create project, enable email/password auth, create `notes` table with `id` (uuid PK), `user_id` (FK to `auth.users`), `title` (text), `content` (text), `created_at` (timestamptz), `deleted_at` (nullable timestamptz for soft delete)
3. **Add auth flow** — login/signup pages using `@supabase/ssr`, protect routes with middleware
4. **Implement notes list** — Server Component that fetches `notes WHERE user_id = current_user AND deleted_at IS NULL`, ordered by `created_at DESC`
5. **Build note editor** — Client Component with `@uiw/react-md-editor`, auto-save on debounced input changes via Supabase upsert
6. **Add real-time sync** — subscribe to `notes` table changes via Supabase Realtime, update UI on insert/update/delete
7. **Implement full-text search** — use Supabase `pgweb` full-text search or `ilike` query on `title` and `content`
8. **Add trash view** — fetch soft-deleted notes, allow restore (set `deleted_at = NULL`) or permanent delete
