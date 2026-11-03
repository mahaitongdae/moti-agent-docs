# Microsoft Teams

The assistant works with your files, mail, meetings and Teams channels. It uses your own sign-in, so it reaches only what you can open yourself. It never changes who a file is shared with and never posts in Teams. Changes wait for **Apply** unless you chose otherwise; see [How changes run](getting-started.md#how-changes-run).

New here? Start with [Getting started](getting-started.md).

| Can do | 1:1 chat | Channel (`@mention`) | Group or meeting chat (`@mention`) |
|---|---|---|---|
| [Files](#files) | your OneDrive and any SharePoint site you can open | the channel's files, its team's site, the company library | files everyone in the chat can open |
| [Mail](#mail) | your mailbox | no | no |
| [Meetings](#meetings) | your calendar | meetings everyone in the channel is invited to | meetings everyone in the chat is invited to |
| [Conversations](#channel-and-chat-conversations) | any team and channel you belong to | this channel | this chat |
| [GitHub todos](github-todo.md) | yes | yes | yes |
| [Scheduled questions](#scheduled-questions) | yes | no | no |

## Files

### Read

```
Find the latest sales report in OneDrive and summarize it
What is in the Contracts folder on the Legal SharePoint site?
Who last changed budget-2026.xlsx, and when?
```

In a channel:

```
@Springphy Agent What files are in this channel?
@Springphy Agent Summarize the project plan on our team site
```

Answers link to the files they used. In a group or meeting chat it reads a file only if everyone in the chat can open it: the company library when everyone is from your company (no guests), or a team's site when everyone in the chat is in that team.

<Screenshot caption="File search and summary in a 1:1 chat" />

| Files | Read as |
|---|---|
| `.txt`, `.md`, `.csv`, `.json`, `.html`, `.xml`, `.yaml`, `.log` and similar | text |
| `.pdf` | text extracted from the PDF |
| Excel (`.xlsx`) | cells as shown in Excel, with sheets and tables (up to 200 rows and 30 columns at a time; ask for a range for more) |
| Word, PowerPoint, older Excel (`.docx`, `.pptx`, `.xls`, older and OpenDocument formats) | converted to PDF by Microsoft 365, then text |
| Images, archives, other formats | not read; name and details only |

Files over 20 MB are not read.

### Change

```
Write today's meeting notes into Development
Mark "Calibrate arm" as done in the Development todo list
Add "order parts" for Bob, due Nov 14, to the todo list
Make an Excel list of the parts we need, with name, count and supplier
Move last year's reports to Archive
Rename the budget draft to 2026-11-01 Budget.md
```

| Can do | |
|---|---|
| Folders | create |
| Text files (`.md`, `.txt`, `.csv`, `.tsv`, `.json`, `.yaml`) | create, replace the whole content |
| Excel (`.xlsx`) | create (one sheet, optionally as a table), change cells, add rows to a table; everything else in the file stays as it is |
| Any file or folder | rename, move, copy, delete (to the recycle bin) |

<Screenshot src="/images/usage/microsoft-teams-01-chat.png" caption="A file change waiting for Apply, then done" />

The card shows every change, including the text it will write (long texts show the first part). It expires after 30 minutes. If someone changes a file after the card was made, replacing or deleting that file, or changing those Excel cells, fails instead of overwriting their work.

It cannot edit Word or PowerPoint content. It moves files only within the same OneDrive or SharePoint library; to another place it copies.

It follows the company's rules for where files go, how to name them, and how to write them. Ask "where should the design review go?" to hear them. See [Company skills](skills.md).

## Mail

Only in a 1:1 chat, and only your own mailbox.

### Read

```
What did Anna send me about the budget?
Summarize my unread mail from today
Find the mail with the signed offer and tell me the start date
```

Answers link to the mails they used. It reads the text of a mail, not its attachments.

### Change

```
Reply to Anna: thanks, Thursday works for me
Forward the offer mail to hr@contoso.com
Write a draft to the team about Friday's release
Move this week's mail from the build robot to the Builds folder
I am out of office Nov 3 to Nov 7, tell people to contact Ben
```

| Can do | |
|---|---|
| Send | new mail, replies, reply all, forwards, drafts you saved |
| Drafts | save a new draft in Drafts |
| Mail | mark read or unread, flag, categories, move to another folder |
| Folders | create, rename |
| Automatic replies | turn on (now or for a time window) or off, with the text to send |

The card shows the full text of each mail. It expires after 30 minutes.

It cannot delete mail, move mail to Deleted Items or a folder inside it, or add attachments. To move mail into a new folder, ask for the folder first, then for the move.

If it says it cannot access your mail, send `/signout microsoft`, then ask again and sign in.

## Meetings

In a 1:1 chat, or `@mention` it in a channel, group chat or meeting chat:

```
When are Anna and Ben free on Tuesday afternoon?
Set up 30 minutes with everyone in this channel on Thursday about the release
Book a meeting with Anna tomorrow at 10 in room Oslo, without a Teams link
What meetings do I have tomorrow?
Move my 1:1 with Ben to Friday at 14:00
Add Carol to the release review and remove Dan
Cancel Thursday's design review and tell everyone it moves to next week
Decline the budget review and ask for Wednesday morning instead
```

In a meeting chat you can talk about "this meeting":

```
@Springphy Agent Move this meeting 30 minutes later
@Springphy Agent When is everyone here free next week? Move this meeting there
```

- It looks up people by name. In a channel or group chat it can invite the members.
- Free/busy shows only when people are busy, not what their meetings are.
- Times are in your own Outlook time zone unless you name another.
- You can move, cancel, or change who is invited only for meetings you organize. For other meetings you can accept, accept as tentative, or decline, and ask the organizer for another time.
- For a repeating meeting, one occurrence changes at a time.
- A new meeting has a Teams link unless you ask for none.
- In a channel or group chat it shows and changes only meetings everyone there is invited to. In a meeting chat it also finds the chat's own meeting, showing only its title, time and organizer. For other meetings, ask in a 1:1 chat.

The card shows the title, old and new time, and who is invited or removed. **Apply** makes the change and sends the invitations or updates.

## Channel and chat conversations

`@mention` it in the channel you want summarized:

```
@Springphy Agent Summarize the major decisions in this channel this week
@Springphy Agent What is still open from yesterday's discussion?
```

Or ask in a 1:1 chat about any team and channel you belong to:

```
Which teams am I in?
Summarize the Engineering › Releases channel since Monday
```

In a group or meeting chat, `@mention` it to summarize that chat. It reads only that chat, never your other chats or channels:

```
@Springphy Agent Summarize what we decided here today
```

Summaries call out decisions and action items.

<Screenshot caption="Channel summary after an @mention" />

### Using it in a channel

- Add the app to the team first; see [Getting started, step 4](getting-started.md#_4-use-it-in-a-channel). For a private or shared channel, add it to that channel too.
- Sign in from a 1:1 chat first. If you `@mention` it before signing in, it asks you to message it directly.
- Each channel thread is its own conversation, shared by everyone in the thread.
- Everyone in the thread sees the answer. So there it never reads your OneDrive, your mail, or other channels.
- Only you can press **Apply** on a change you asked for. If someone else presses it, only they see a note and the card stays.

## Scheduled questions

Ask it to answer a question for you every day or every weekday at a set time. Set one up in your 1:1 chat or in Threads:

```
Every weekday at 8:00, summarize my unread mail, today's meetings and my GitHub todos
Every day at 17:30, list mail I have not answered today
What schedules do I have?
Stop my morning summary
```

- Times are in your own Outlook time zone, unless you name another (for example "8:00 Berlin time").
- You can have up to 5.
- Send `/schedules` to see them. To stop one, ask it to delete it.
- Each answer comes as a message in your 1:1 chat, never in a channel or group chat. It also shows up in Threads as its own conversation, so you can ask follow-up questions there.
- It never changes anything on its own. A scheduled answer only reads. If something needs a change, it says so; ask for it in the chat.
- Scheduled answers count toward your usage limits, like any question.

Sign-in: when you set one up, it checks that you are signed in (to Microsoft 365, and to GitHub if the question needs it). If not, it sends the sign-in card and saves nothing; sign in, then ask again. If your sign-in has run out by the time it is due, that answer is skipped: you get a short message and the sign-in card. The next one runs as planned.

If the server is down at the planned time and comes back more than an hour later, that answer is skipped.

Admins: see [Microsoft Teams setup](../setup/microsoft-teams.md) and [Agent settings](../setup/agent-settings.md).
