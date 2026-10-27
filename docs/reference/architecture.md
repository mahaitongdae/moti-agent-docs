# Architecture

One Node.js process, one PostgreSQL database, one data volume. No message broker, workflow engine, or extra services.

```text
Microsoft Teams ──HTTPS──> Caddy ──> app (Node 24, TypeScript)
                                      ├─ Teams SDK (@microsoft/teams.apps)   apps/teams-bot/src/teams-adapter.ts
                                      ├─ Threads tab (page, functions, send) apps/teams-bot/src/threads-tab.ts, apps/teams-bot/threads-tab/
                                      │    └─ ThreadService                   packages/agent/threads.ts
                                      ├─ AgentService                        packages/agent/service.ts
                                      │    ├─ IdentityService (tenant allowlist, users)   packages/auth/entra/identity.ts
                                      │    ├─ SessionService (ownership)                  packages/agent/sessions/
                                      │    ├─ RunQueue (concurrency, cancel)              packages/agent/runtime/run-queue.ts
                                      │    └─ usage limits                                packages/agent/usage.ts
                                      ├─ PiRuntime (Pi SDK)                  packages/agent/runtime/pi-runtime.ts
                                      ├─ Tool registry + policy              packages/tools/registry.ts, packages/auth/permissions/
                                      ├─ Graph tools                         packages/tools/microsoft/{onedrive,teams,outlook}/
                                      ├─ GitHub tools (optional)             packages/tools/github/
                                      ├─ ProposalService (approve changes)   packages/agent/proposals.ts
                                      ├─ UserTokenService (per connection)   packages/auth/user-token.ts
                                      │    └─ GraphTokenService (+ identity)  packages/auth/entra/graph-token.ts
                                      └─ AuditLog                            packages/audit/
                                           │
             PostgreSQL <──────────────────┤  users, sessions, agent_runs, tool_invocations,
                                           │  oauth_connections, audit_events, usage_records, inbound_activities,
                                           │  pending_actions
             /data/pi-sessions <───────────┘  Pi session files (JSONL transcripts)
```

## Request flow

1. Teams POSTs an activity to `/api/messages`. The Teams SDK validates the Bot Framework JWT and strips the `@mention`.
2. `AgentService.handleMessage` (fast path, inside the HTTP request):
   - resolves the sender: tenant must be in `microsoft.allowedTenantIds`, user must be `active`;
   - records the activity id; a repeated id is a duplicate delivery and is dropped;
   - handles commands (`/new`, `/reset`, `/cancel`, `/stop`, `/signout`, `/help`);
   - checks per-user limits, resolves the session, inserts an `agent_runs` row, enqueues the run, sends a typing indicator.
   The HTTP request then returns. Agent execution never depends on it.
3. The `RunQueue` runs at most `limits.concurrentAnswers` runs at once and one run per session at a time.
4. A run reloads the session, builds the tool list for the session kind, and calls Pi. Pi streams text:
   - 1:1 chats use Teams streaming (`ctx.stream`): progress notes ("Search files…") at each tool call, then text chunks, then one final message. When the user presses **Stop**, Teams rejects the next chunk and the run is cancelled.
   - Channels and group chats get one message that is edited as text arrives.
   Neither needs an open HTTP request. Final answers carry the AI-generated label and feedback buttons; a 👍 / 👎 is audited as `feedback_received` (reaction only).
5. Usage (tokens, cost) is stored per assistant message. Tool calls are audited. The run is marked `succeeded`, `failed`, `cancelled`, `timed_out`, or (after a crash) `interrupted`.

## Sessions

| Teams conversation | Session kind | Owner | Tools |
|---|---|---|---|
| 1:1 chat | `personal` | the user | all Graph tools, with the user's token; GitHub tools with the user's GitHub token |
| Channel thread | `channel` | the channel thread (`team_id`, `channel_id`, thread conversation id) | `get_channel_messages` for the current channel only |
| Group chat | `group` | the group chat | none |

- Session identity: `tenant_id`, `user_id` (personal only), `conversation_id`, `session_id`.
- A channel session is never an employee's private session. Anything a shared session can read is already visible to its members, so another member cannot pull one user's private files through the shared context.
- In shared sessions each message is prefixed with the sender's name so Pi can tell speakers apart.
- `/new` archives the active session; the next message creates a new one with a new Pi session file. Teams cannot clear the chat, so a **New conversation** card marks the boundary.
- Each session stores a `title` (the start of its first message) and `last_message_at`.

## Threads tab

A personal tab in the Teams app (`staticTabs` entity `threads`, listed before the bot's Chat tab), served at `/tabs/threads/` as plain HTML and JavaScript (no build step). `@microsoft/teams-js`, `marked` and `DOMPurify` are served from `node_modules`.

- The page gets a Teams single sign-on token (`authentication.getAuthToken`) for every call.
- Functions (`/api/functions/threads.*`, via `app.function`): `list`, `get`, `rename`, `hide`, `stop`, `continue`, `decide`, `feedback`, `signout`. The Teams SDK validates the token (signature, audience `api://<HOST>/botid-<CLIENT_ID>` or the client id). Without `microsoft.clientId` every call gets `401`.
- Sending is `POST /api/threads/send`: the same token check (the SDK's `RemoteFunctionValidator`), then server-sent events over the response: `thread`, `status` (tool progress), `delta` (answer text), `approval`, `signin`, `done`, `error`. The run goes through `AgentService.startThreadRun` (same limits, queue, audit and Pi run as the chat) with a web `Replier`.
- The run does not depend on the connection. Closing the page leaves it running; the answer is saved in the Pi file and shown when the thread is opened again. Stop is an explicit `threads.stop`.
- `ThreadService` maps the token's tenant and object id to an existing `users` row (tenant allowlist and blocking apply; no user is created) and touches only that user's `personal` sessions that are not hidden.
- A thread is a `personal` session. Threads created in the tab belong to the user's 1:1 chat with the bot but are not its active session: the chat and the tab each keep their own current conversation. **Continue in Chat** makes a thread the chat's active session (one transaction; the unique active-session index holds) and posts a note in the chat. Installing the app creates the chat's session, so the tab works before the first message.
- **Delete** sets `hidden_at`; the session and Pi file stay and follow the usual retention.
- Sign-in stays in the chat: when a tool needs a sign-in, the app sends the OAuth card into the user's 1:1 chat with the bot (`TeamsApp.sendSignInCard`: the same card `OAuthFlow.signIn` sends, built from the stored conversation, without an inbound activity). The SDK's sign-in invoke handlers finish it there. The tab gets a `signin` event. Sending is tried twice; if both fail, the answer says sign-in is not available, as in the chat.
- A transcript is read from the Pi session file: user and assistant text only, no tool calls. Proposals of the session come from `pending_actions`.
- Pi owns the transcript and context management (including compaction). The application owns ownership and access: the Pi file path is stored on the session row and never derived from user input.

## Configuration

`packages/shared/config.ts` merges `config/agent.yaml` (public defaults, in git) with `config/agent.private.yaml` (company values, not in git; values there win), checks the result against a TypeBox schema (unknown keys and wrong values stop startup), and adds secrets and container settings from the environment (`CLIENT_SECRET`, provider keys, `DATABASE_URL`, `PUBLIC_HOSTNAME`, `PORT`, `DATA_DIR`). A setting that moved to YAML is refused in the environment. The Docker image contains `agent.yaml`; Compose mounts the private file read-only.

## Model choice

- `models.default` is the default model. `models.extra` adds models for Entra groups; `ModelAccess` (`packages/agent/models.ts`) checks membership with the user's Graph token and caches it.
- A 1:1 session stores its model (`sessions.model`); new 1:1 sessions start with the user's last choice (`users.last_model`). Shared sessions use the default model.
- Before each run the session's model is checked against the user's groups. The run passes the model to Pi; when it differs from the one the Pi session last used, Pi's own `setModel` records the switch (a `model_change` entry), so the session file shows which model answered from then on.
- Thinking level works the same way: `sessions.thinking` and `users.last_thinking` (null: the model's default, its `models.extra` `thinking` or else `models.thinking`). It is not limited by group. An existing Pi session restores its own level; the run then calls Pi's `setThinkingLevel`, which fits the level to the model and records a `thinking_level_change` entry when it changes.
- `agent_runs` records the model of each run; `usage_records` the model Pi reports for each answer.

## Pi integration

Each run:
- opens the session file (or creates one under `/data/pi-sessions/<session_id>/`);
- uses in-memory settings (install telemetry off) and a resource loader with extensions, skills, prompt templates, themes and context files disabled, so Pi's codemode, tool search, and MCP extensions are never loaded. Company skills (`skills/`, `skillsDir`) are the one exception: Pi loads them from that folder only, lists them in its own `<available_skills>` section, and expands `/skill:name`. Pi's built-in `read` tool is replaced by the app's `read` (`packages/tools/skills/`), which reads only files whose real path is inside `skillsDir`; skills whose files sit outside are filtered out. The runtime checks that every active tool is exactly the app's definition;
- passes an explicit tool allowlist, so Pi's built-in `read`, `bash`, `edit`, `write` are never enabled (checked after creation);
- binds tools to the requesting user for this run only, then disposes the session.

Pi version: `@earendil-works/pi-coding-agent` 1.4.0. One `ModelRuntime` is shared by all runs; it uses an in-memory credential store (or the one file `models.authFile`, for a subscription login), no `models.json`, and no network catalog refresh. The model comes from `models.default` (any model in Pi's built-in catalog). API keys come from the provider's standard environment variable or `PI_API_KEY`.

## Tools

All Microsoft 365 tools are Graph calls with the requesting user's delegated token. They only read, except `propose_mail_changes`, whose changes run after approval.

| Tool | Graph call |
|---|---|
| `search_files(query, limit?)` | `POST /search/query` (driveItem) — OneDrive and SharePoint |
| `list_folder(folder_id, limit?)` | `GET /me/drive/root/children` or `/drives/{d}/items/{i}/children` |
| `get_file_metadata(file_id)` | `GET /drives/{d}/items/{i}` |
| `read_file(file_id)` | item metadata + `/content` (text, PDF) or `/content?format=pdf` (Office); text extracted with `unpdf` |
| `list_accessible_teams()` | `GET /me/joinedTeams` |
| `list_channels(team_id)` | `GET /teams/{t}/channels` |
| `get_channel_messages(team_id, channel_id, limit?, since?)` | `GET /teams/{t}/channels/{c}/messages?$expand=replies` |
| `search_mail(query?, since?, limit?)` | `GET /me/messages` with `$search` (query), or `$filter` + `$orderby` on `receivedDateTime` |
| `read_mail(message_id)` | `GET /me/messages/{id}`; HTML body converted to text, attachments not read |
| `list_mail_folders(parent_folder_id?)` | `GET /me/mailFolders` or `/me/mailFolders/{id}/childFolders` |
| `get_auto_reply()` | `GET /me/mailboxSettings/automaticRepliesSetting` |
| `propose_mail_changes(changes[])` | reads only: checks messages (`GET /me/messages/{id}`, drafts must be drafts) and folders (`GET /me/mailFolders/{id}`; the target must not be Deleted Items or any folder inside it, checked up the parent chain) |

Mail changes are applied after approval by `applyMailChanges` (`packages/tools/microsoft/outlook/changes.ts`): `send_mail` (`POST /me/sendMail`), `create_draft` (`POST /me/messages`), `send_draft` (`POST .../send`), `reply` (`.../reply` or `.../replyAll`), `forward`, `update_message` (`PATCH /me/messages/{id}`, `POST .../move`), `create_folder`, `rename_folder` (`/me/mailFolders`), `set_auto_reply` (`PATCH /me/mailboxSettings`). Mail bodies are sent as plain text; reply, forward and automatic reply texts are HTML-escaped. There is no delete.

Notes:
- `file_id` is `driveId:itemId`, so the same tools cover OneDrive and SharePoint libraries (there is no separate `sharepoint` package).
- Tools show each `web_url` as a short id (`src:1a2b3c4d`), so the model does not spend 100+ tokens writing out each Outlook or SharePoint link. The id map is kept in the tool result in the Pi session; answers (streamed, final, and in the Threads tab) and tool arguments get the real links back (`packages/tools/links.ts`).
- Mail tools use `/me/messages`, so they reach only the signed-in user's own mailbox. They are allowed in 1:1 chats only.
- `get_channel_messages` takes `team_id` in addition to the planned `channel_id`, because Graph addresses channels within a team.

## GitHub todo list (optional)

GitHub holds all data (issues, assignees, milestones, "blocked by" dependencies, and with a project its `Status` and `Target date`). The app keeps no copy. The project is optional:
- With `github.project`, the todo list is that organization project.
- Without it, the todo list is the issues of one repository (`github.defaultRepo` unless the user names one); a milestone's due date is the target date, and `status` / `target_date` changes are refused.

| Tool | GitHub calls |
|---|---|
| `list_todos(assignee?, status?, repo?, due_before?, include_closed?, limit?)` | with a project: `GET /orgs/{org}/projectsV2/{n}/fields`, `.../items`; without: `GET /repos/{o}/{r}/issues` (up to 1000 issues, filtered in code) |
| `get_issue(repo, number)` | `GET /repos/{o}/{r}/issues/{n}`, `.../dependencies/blocked_by`, `.../dependencies/blocking`, `.../sub_issues`, `.../comments` (latest 20 of the first 100), project items |
| `propose_issue_changes(changes[])` | reads only: checks issues, assignees (`GET .../assignees/{login}`), milestones (`GET .../milestones`), labels (`GET .../labels`), field names and status options |

Changes (`create_issue`, `update_issue`, `add_comment`, `add_blocker`, `remove_blocker`, `create_milestone`, `update_milestone`) are applied after approval by `applyChanges` (`packages/tools/github/changes.ts`): `POST/PATCH /repos/{o}/{r}/issues`, `POST/DELETE .../labels`, `POST .../comments`, `POST/DELETE .../dependencies/blocked_by`, `POST/PATCH .../milestones`, `POST/PATCH /orgs/{org}/projectsV2/{n}/items` (only with a project).

Approval flow:
1. The tool stores the checked change in `pending_actions` and the run sends an Adaptive Card with **Apply** / **Cancel** (`Action.Execute`).
2. The press arrives as an `adaptiveCard/action` invoke. `AgentService.handleCardAction` resolves the user, claims the proposal, and replaces the card with "Applying…".
3. Changes run in the background with the user's GitHub or Microsoft 365 token; the result is posted as a new message and stored on the row.

Not included: automatic updates without a user request (for example from GitHub webhooks). Those would need a credential that is not tied to one employee. Use the project's built-in workflows (auto-add, close → Done) instead.

## Key decisions

- **Graph tokens via the Bot Framework token service** (Teams SDK `OAuthFlow`). The service stores and refreshes delegated tokens; this app never persists tokens. See [authentication.md](authentication.md).
- **No build step.** Node 24 runs the TypeScript sources directly (type stripping). `tsc` is used for type checking only.
- **Single package, monorepo layout.** Folders follow the planned structure; modules import each other by relative path. Workspaces can be introduced if packages need separate versioning.
- **In-process queue.** Enough for limited concurrency on one server. Open runs are marked `interrupted` on restart and the user is told to resend.
