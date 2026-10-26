# Microsoft Teams

Talk to the assistant in a 1:1 chat or `@mention` it in a channel. It answers questions, searches and summarizes OneDrive and SharePoint files, and summarizes Teams channels. It uses your own sign-in, so it only reaches files and channels you can open yourself. It never edits, moves, shares, deletes, or posts anything in Microsoft 365.

## Where to talk to it

| Where | Can do |
|---|---|
| 1:1 chat | everything: questions, your files, any team and channel you belong to |
| Channel (`@mention`) | questions, and read that channel only |
| Group chat | questions only |

Open the app in Teams (Apps → **Built for your org**, or the pinned icon) and send a message. When you first add the app, or send `/help`, it shows a card with what it can do and example questions you can press.

In a 1:1 chat the answer streams in while it is written. Above it you see notes such as "Search files…", and Teams shows a **Stop** button. In channels the answer is one message that grows. Answers are marked as AI generated and have 👍 / 👎 buttons. Only which button you pressed is kept, not the comment you type.

The conversation keeps its context until you start a new one.

<Screenshot caption="A 1:1 chat with the assistant" />

In a channel, each thread is its own conversation, shared by everyone in the thread.

## First use: sign in

The first time you ask about files or channels in a 1:1 chat, Teams signs you in silently. If that does not work, the assistant sends a sign-in card. Press **Sign in**, then ask again. If you `@mention` it in a channel before signing in, it asks you to message it directly first.

<Screenshot caption="Microsoft 365 sign-in card" />

## Files

Ask in a 1:1 chat:

```
Find the latest sales report in OneDrive and summarize it
What is in the Contracts folder on the Legal SharePoint site?
Who last changed budget-2026.xlsx, and when?
```

Answers link to the files they used.

<Screenshot caption="File search and summary in a 1:1 chat" />

| Files | Read as |
|---|---|
| `.txt`, `.md`, `.csv`, `.json`, `.html`, `.xml`, `.yaml`, `.log` and similar | text |
| `.pdf` | text extracted from the PDF |
| Word, Excel, PowerPoint (`.docx`, `.xlsx`, `.pptx`, older and OpenDocument formats) | converted to PDF by Microsoft 365, then text |
| Images, archives, other formats | not read; name and details only |

Files over 20 MB are not read.

## Channel summaries

`@mention` the assistant in the channel you want summarized:

```
@Moti Agent Summarize the major decisions in this channel this week
@Moti Agent What is still open from yesterday's discussion?
```

Or ask in a 1:1 chat about any team and channel you belong to:

```
Which teams am I in?
Summarize the Engineering › Releases channel since Monday
```

Summaries call out decisions and action items.

<Screenshot caption="Channel summary after an @mention" />

## Threads

The **Threads** tab is the first tab of the app: a chat page with all your 1:1 conversations with the assistant.

- The list on the left shows your threads, newest first, grouped by day. The title is the start of the first message. Search by title.
- **New thread** starts an empty one. Type and press Enter; Shift+Enter adds a line.
- Answers appear as they are written, with tables, lists and code blocks. **Stop** (the square button) stops an answer.
- Under an answer: copy, 👍 and 👎.
- Proposed GitHub changes show **Apply** and **Cancel** right in the thread.
- Type `/` for commands: `/new`, `/help`, `/stop`, `/model`, `/thinking`, `/signout`.
- The model name at the top opens a menu: the models your admin allows you, and, under **Thinking**, how much the model thinks before answering (when the model supports it). The choice applies to this thread. New threads start with what you chose last.
- **⋯** next to a thread: **Rename**, **Continue in Chat** (the Teams chat then continues this thread), **Delete** (removes it from your list).
- If you close the tab while an answer is written, it is still saved; open the thread again to see it.

Sign-in happens in Chat. When a question in Threads needs your files, channels or GitHub and you are not signed in, the assistant sends a sign-in card to your **Chat** with it and the thread says so. Sign in there, then ask again in Threads.

The **Chat** tab and Threads each have their own current conversation. Writing in Threads does not change what Chat continues, unless you choose **Continue in Chat**.

Only you see your threads. Channel and group chat conversations are not listed.

<Screenshot caption="Threads tab" />

## New conversation in Chat

`/new` starts a new conversation. Teams keeps the earlier messages on screen. A **New conversation** card marks where the new one starts; messages above it are no longer used. The card shows the title of the previous conversation; **Open in Threads** opens it there.

## Commands

| Command | Does |
|---|---|
| `/new` (or `/reset`) | start a new conversation; earlier context is no longer used |
| `/cancel` (or `/stop`) | stop the answer that is being written |
| `/model` | choose the model for this conversation (1:1 chat only; lists the models your admin allows you) |
| `/thinking` | choose how much the model thinks before answering, for this conversation (1:1 chat only; the levels depend on the model). More thinking can help with hard questions but is slower and costs more |
| `/signout` | disconnect Microsoft 365 (and GitHub, if used) |
| `/help` | show what the assistant can do |

## Messages you may see

| Message | Meaning |
|---|---|
| You have reached the hourly request limit | wait and try again; the admin sets the limit |
| You have reached your monthly usage limit | your share of model cost for this month is used up; it resets on the 1st (UTC), or ask your admin |
| The assistant is busy right now | too many waiting messages; try again in a minute |
| The request took too long and was stopped | ask a narrower question |
| Your previous request was interrupted by a server restart | send it again |
| Your access to this assistant is disabled | ask your admin |
| Threads: Open Chat and send the assistant a message first | Threads works after you have added the app and opened its chat once |

Admins: see [Microsoft Teams setup](../setup/microsoft-teams.md) and [Agent settings](../setup/agent-settings.md).
