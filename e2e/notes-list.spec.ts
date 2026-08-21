import { test, expect } from "@playwright/test";
import { uniqueEmail, signup, getUserId, createNote } from "./helpers";

test.describe("Notes list", () => {
  test("empty state shows message", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);
    await expect(page.locator("text=No notes yet")).toBeVisible();
  });

  test("notes appear in list after creation", async ({ page, request }) => {
    const email = uniqueEmail();
    await signup(page, email);
    const userId = await getUserId(page);

    await createNote(request, userId, { title: "My first note", content: "Hello world" });
    await createNote(request, userId, { title: "Second note", content: "# Heading\nSome content" });

    await page.reload();

    const notes = page.locator("nav a");
    await expect(notes).toHaveCount(2);
    await expect(notes.first()).toContainText("Second note");
    await expect(notes.last()).toContainText("My first note");
  });

  test("note shows preview of content", async ({ page, request }) => {
    const email = uniqueEmail();
    await signup(page, email);
    const userId = await getUserId(page);

    await createNote(request, userId, { title: "Preview test", content: "This is the preview text" });

    await page.reload();

    await expect(page.locator("nav a")).toContainText("This is the preview text");
  });

  test("notes without title show Untitled", async ({ page, request }) => {
    const email = uniqueEmail();
    await signup(page, email);
    const userId = await getUserId(page);

    await createNote(request, userId, { title: "", content: "Content only" });

    await page.reload();

    await expect(page.locator("nav a")).toContainText("Untitled");
  });

  test("note shows creation date", async ({ page, request }) => {
    const email = uniqueEmail();
    await signup(page, email);
    const userId = await getUserId(page);

    await createNote(request, userId, { title: "Dated note", content: "" });

    await page.reload();

    const today = new Date().toLocaleDateString("en-US");
    await expect(page.locator("nav a time")).toContainText(today);
  });
});
