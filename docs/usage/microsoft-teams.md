# Microsoft Teams

Talk to the assistant in a 1:1 chat or `@mention` it in a channel. It answers questions, searches and summarizes OneDrive and SharePoint files, and summarizes Teams channels. It uses your own sign-in, so it only reaches files and channels you can open yourself. It never edits, moves, shares, deletes, or posts anything in Microsoft 365.

## Where to talk to it

| Where | Can do |
|---|---|
| 1:1 chat | everything: questions, your files, any team and channel you belong to |
| Channel (`@mention`) | questions, and read that channel only |
| Group chat | questions only |

Open the app in Teams (Apps → **Built for your org**, or the pinned icon) and send a message. Replies stream in as one message that grows while the answer is written. The conversation keeps its context until you start a new one.

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

## Commands

| Command | Does |
|---|---|
| `/new` (or `/reset`) | start a new conversation; earlier context is cleared |
| `/cancel` (or `/stop`) | stop the answer that is being written |
| `/signout` | disconnect Microsoft 365 (and GitHub, if used) |

## Messages you may see

| Message | Meaning |
|---|---|
| You have reached the hourly request limit | wait and try again; the admin sets the limit |
| The assistant is busy right now | too many waiting messages; try again in a minute |
| The request took too long and was stopped | ask a narrower question |
| Your previous request was interrupted by a server restart | send it again |
| Your access to this assistant is disabled | ask your admin |

Admins: see [Microsoft Teams setup](../setup/microsoft-teams.md).
