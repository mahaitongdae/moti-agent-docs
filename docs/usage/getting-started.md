# Getting started

Add the assistant in Teams, sign in, and ask your first question. It takes a few minutes.

## 1. Add the app

In Teams, open **Apps** in the left bar, then **Built for your org**. Click **Springphy Agent**.

<Screenshot src="/images/usage/getting-started-01-built-for-your-org.png" caption="Apps → Built for your org" />

If you do not see it there, search for "Springphy Agent" under Apps. If it is still missing, ask your admin to allow it for you.

The app page opens. Click **Add**.

<Screenshot src="/images/usage/getting-started-02-add.png" caption="Springphy Agent → Add" />

To keep it in the left bar: click **⋯** in the left bar, point at **Springphy Agent**, click its **⋯**, and choose **Pin**.

<Screenshot src="/images/usage/getting-started-03-pin.png" caption="⋯ → Springphy Agent → ⋯ → Pin" />

## 2. Say Hello: in a 1:1 Chat / Thread

The app has two tabs. It opens on **Threads**.

<Screenshot src="/images/usage/getting-started-04-tabs.png" caption="The Threads and Chat tabs" />

| Tab | What it is |
|---|---|
| **Threads** | a chat page like a web chat app. The list on the left keeps all your conversations. See [Threads](#threads) |
| **Chat** | a normal Teams chat. It shows one conversation at a time |

Why Threads: a Teams chat is one long stream. When you start a new topic, the old one is hard to get back to. In Threads each topic is its own conversation, so you can come back to it later, search it, and keep its own model. Conversations from Chat appear in the Threads list too.

To switch conversations:

| To | In Threads | In Chat |
|---|---|---|
| start a new one | **New thread** | send `/new` |
| go back to an older one | click it in the list | in Threads, click **⋯** next to it → **Continue in Chat** |

To start, press one of the example questions, or type your own.



## 3. Sign in

The first time you ask about files, mail, meetings or channels, Teams signs you in by itself. If it cannot, the assistant sends a card with a **Sign in** button. Press it, sign in with your work account, then ask again.

The assistant then works with your own access. It sees only the files, mail and channels you can open yourself.

## 4. Use it in a channel

To use it in a team's channels, add it to the team once: open the app in Apps, choose **Add to a team** (from the arrow next to **Add**), and pick the team. For a private or shared channel, add it to that channel too.

Then `@mention` it in a channel:

```
@Springphy Agent Summarize the major decisions in this channel this week
```

Everyone in the thread sees the answer. In channels it does not read your own OneDrive or mail. See [Using it in a channel](microsoft-teams.md#using-it-in-a-channel).

## Commands

| Command | Does |
|---|---|
| `/new` (or `/reset`) | start a new conversation; earlier context is no longer used |
| `/cancel` (or `/stop`) | stop the answer that is being written |
| `/model` | choose the model for this conversation (1:1 chat only; lists the models your admin allows you) |
| `/thinking` | choose how much the model thinks before answering, for this conversation (1:1 chat only; the levels depend on the model). More thinking can help with hard questions but is slower and costs more |
| `/mode` | choose how changes run: **Ask before each change** (the default) or **Apply without asking**. See [How changes run](#how-changes-run) |
| `/schedules` | show your scheduled questions. See [Scheduled questions](microsoft-teams.md#scheduled-questions) |
| `/signout` | disconnect an account. With GitHub in use, it asks which one; or send `/signout microsoft`, `/signout github` or `/signout all` |
| `/help` | show what the assistant can do |

## How changes run

By default every change (files, mail, meetings, GitHub) waits on a card until you press **Apply**. Send `/mode` and choose **Apply without asking** to skip the card: the assistant then makes the change right away and tells you the result. Choose **Ask before each change** to go back.

- It only works in your 1:1 chat and Threads. In channels and group chats, changes always wait for **Apply**.
- It is one setting for all your conversations.
- Without the card, you cannot check a change before it runs. Mail is sent at once. Use it only if you trust what you ask for, and be careful when the assistant reads mail or files from other people: text in them could ask for changes you did not want.

## New conversation in Chat

`/new` starts a new conversation. Teams keeps the earlier messages on screen. A **New conversation** card marks where the new one starts; messages above it are no longer used. The card shows the title of the previous conversation; **Open in Threads** opens it there.

## Threads

- Search the list by title. Enter sends; Shift+Enter adds a line.
- **Stop** (the square button) stops an answer. Type `/` for commands.
- The model name at the top opens a menu: the model and **Thinking** for this thread, and **Changes** for all your threads (see [How changes run](#how-changes-run)). New threads start with the model you chose last.
- **⋯** next to a thread: **Rename**, **Continue in Chat** (Chat then continues this thread), **Delete**.
- If you close the tab while an answer is written, it is still saved.
- Sign-in happens in Chat. When a question in Threads needs you to sign in, the sign-in card goes to **Chat**. Sign in there, then ask again.
- Only you see your threads. Channel and group chat conversations are not listed.

## Messages you may see

| Message | Meaning |
|---|---|
| You have reached the hourly request limit | wait and try again; the admin sets the limit |
| You have reached your monthly usage limit | your share of model cost for this month is used up; it resets on the 1st (UTC), or ask your admin |
| The assistant is busy right now | too many waiting messages; try again in a minute |
| The request took too long and was stopped | ask a narrower question |
| Your previous request was interrupted by a server restart | send it again |
| Your access to this assistant is disabled | ask your admin |
| Your schedule "..." did not run: please sign in | sign in with the card below it; the next one runs as planned |
| Threads: Open Chat and send the assistant a message first | Threads works after you have added the app and opened its chat once |

## Next

- [Microsoft Teams](microsoft-teams.md): what it can do with files, mail, meetings and channels
- [GitHub todo list](github-todo.md), if your company uses it
- [Company skills](skills.md): company rules and templates it follows

Admins: see [Microsoft Teams setup](../setup/microsoft-teams.md).
