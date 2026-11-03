# GitHub todo list

If your company turned it on: in a 1:1 chat, a channel, or a group or meeting chat, the assistant keeps a todo list in GitHub: issues with assignees, target dates, and "blocked by" dependencies. It uses your own GitHub account. It only proposes changes; nothing changes until you press **Apply**.

## First use: sign in to GitHub

The first time you ask about todos, the assistant sends a GitHub sign-in card. Press **Sign in**, allow access, then ask again.

<Screenshot src="/images/usage/github-todo-01-sign-in.png" caption="GitHub sign-in card" />

## Look at todos

```
What is on my todo list?
Which issues are due before Friday?
What is blocking #42?
```

<Screenshot src="/images/usage/github-todo-02-list.png" caption="Todo list in Threads" />

## Change todos

```
Create an issue "Update price list", assign it to alice, target date next Friday
Close #42
#57 is blocked by #42
```

The assistant replies with a card listing the changes. Check it, then press **Apply** or **Cancel**. The result arrives as a new message. With [`/mode`](getting-started.md#how-changes-run) set to **Apply without asking**, changes in your 1:1 chat run right away instead.

<Screenshot caption="Approval card with Apply and Cancel" />

- Only the person who asked can press Apply.
- A card expires after 30 minutes; ask again for a new one.
- One card can hold up to 20 related changes.

What can be changed: create issues; title, description, assignees, labels, open/closed, milestone; add comments; add or remove "blocked by"; create, rename, re-date, close or reopen milestones; with a project also status and target date. Labels and projects are not created by the assistant; use existing ones.

In a channel, group chat or meeting chat, `@mention` the assistant. Everyone there sees the answers, changes always wait for Apply, and only the person who asked can press it. Sign in to GitHub in a 1:1 chat first. `/signout github` disconnects only GitHub; `/signout all` disconnects GitHub and Microsoft 365.

Admins: see [GitHub todo list setup](../setup/github-todo.md).
