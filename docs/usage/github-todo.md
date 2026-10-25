# GitHub todo list

If your company turned it on: in a 1:1 chat the assistant keeps a todo list in GitHub: issues with assignees, target dates, and "blocked by" dependencies. It uses your own GitHub account. It only proposes changes; nothing changes until you press **Apply**.

## First use: sign in to GitHub

The first time you ask about todos, the assistant sends a GitHub sign-in card. Press **Sign in**, allow access, then ask again.

<Screenshot caption="GitHub sign-in card" />

## Look at todos

```
What is on my todo list?
Which issues are due before Friday?
What is blocking #42?
```

<Screenshot caption="Todo list in a 1:1 chat" />

## Change todos

```
Create an issue "Update price list", assign it to alice, target date next Friday
Close #42
#57 is blocked by #42
```

The assistant replies with a card listing the changes. Check it, then press **Apply** or **Cancel**. The result arrives as a new message.

<Screenshot caption="Approval card with Apply and Cancel" />

- Only the person who asked can press Apply.
- A card expires after 30 minutes; ask again for a new one.
- One card can hold up to 20 related changes.

What can be changed: create issues; title, assignees, open/closed, milestone; add or remove "blocked by"; create or reopen milestones with a due date; with a project also status and target date. Projects are not created by the assistant.

GitHub works only in 1:1 chats. `/signout` disconnects both Microsoft 365 and GitHub.

Admins: see [GitHub todo list setup](../setup/github-todo.md).
