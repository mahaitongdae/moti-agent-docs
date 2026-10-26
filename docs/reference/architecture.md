# Architecture

One Node.js process, one PostgreSQL database, one data volume. No message broker, workflow engine, or extra services.

```text
Microsoft Teams ──HTTPS──> Caddy ──> app (Node 24, TypeScript)
                                      ├─ Teams SDK (@microsoft/teams.apps)   apps/teams-bot/src/teams-adapter.ts
                                      ├─ AgentService                        packages/agent/service.ts
                                      │    ├─ IdentityService (tenant allowlist, users)   packages/auth/entra/identity.ts
                                      │    ├─ SessionService (ownership)                  packages/agent/sessions/
                                      │    ├─ RunQueue (concurrency, cancel)              packages/agent/runtime/run-queue.ts
                                      │    └─ usage limits                                packages/agent/usage.ts
                                      ├─ PiRuntime (Pi SDK)                  packages/agent/runtime/pi-runtime.ts
                                      ├─ Tool registry + policy              packages/tools/registry.ts, packages/auth/permissions/
                                      ├─ Graph tools                         packages/tools/microsoft/{onedrive,teams}/
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
   - resolves the sender: tenant must be in `ALLOWED_TENANT_IDS`, user must be `active`;
   - records the activity id; a repeated id is a duplicate delivery and is dropped;
   - handles commands (`/new`, `/reset`, `/cancel`, `/stop`, `/signout`);
   - checks per-user limits, resolves the session, inserts an `agent_runs` row, enqueues the run, sends a typing indicator.
   The HTTP request then returns. Agent execution never depends on it.
3. The `RunQueue` runs at most `AGENT_MAX_CONCURRENCY` runs at once and one run per session at a time.
4. A run reloads the session, builds the tool list for the session kind, and calls Pi. Pi streams text; the reply is sent as one Teams message that is edited as text arrives (works in 1:1 and channels, no open HTTP request needed).
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
- `/new` archives the active session; the next message creates a new one with a new Pi session file.
- Pi owns the transcript and context management (including compaction). The application owns ownership and access: the Pi file path is stored on the session row and never derived from user input.

## Pi integration

Each run:
- opens the session file (or creates one under `/data/pi-sessions/<session_id>/`);
- uses in-memory settings (install telemetry off) and a resource loader with extensions, skills, prompt templates, themes and context files disabled, so Pi's codemode, tool search, and MCP extensions are never loaded. Company skills (`skills/`, `SKILLS_DIR`) are the one exception: Pi loads them from that folder only, lists them in its own `<available_skills>` section, and expands `/skill:name`. Pi's built-in `read` tool is replaced by the app's `read` (`packages/tools/skills/`), which reads only files whose real path is inside `SKILLS_DIR`; skills whose files sit outside are filtered out. The runtime checks that every active tool is exactly the app's definition;
- passes an explicit tool allowlist, so Pi's built-in `read`, `bash`, `edit`, `write` are never enabled (checked after creation);
- binds tools to the requesting user for this run only, then disposes the session.

Pi version: `@earendil-works/pi-coding-agent` 1.4.0. One `ModelRuntime` is shared by all runs; it uses an in-memory credential store, no `models.json`, and no network catalog refresh. The model comes from `PI_PROVIDER` / `PI_MODEL` (any model in Pi's built-in catalog). API keys come from the provider's standard environment variable or `PI_API_KEY`.

## Tools

All Microsoft 365 tools are read-only Graph calls with the requesting user's delegated token.

| Tool | Graph call |
|---|---|
| `search_files(query, limit?)` | `POST /search/query` (driveItem) — OneDrive and SharePoint |
| `list_folder(folder_id, limit?)` | `GET /me/drive/root/children` or `/drives/{d}/items/{i}/children` |
| `get_file_metadata(file_id)` | `GET /drives/{d}/items/{i}` |
| `read_file(file_id)` | item metadata + `/content` (text, PDF) or `/content?format=pdf` (Office); text extracted with `unpdf` |
| `list_accessible_teams()` | `GET /me/joinedTeams` |
| `list_channels(team_id)` | `GET /teams/{t}/channels` |
| `get_channel_messages(team_id, channel_id, limit?, since?)` | `GET /teams/{t}/channels/{c}/messages?$expand=replies` |

Notes:
- `file_id` is `driveId:itemId`, so the same tools cover OneDrive and SharePoint libraries (there is no separate `sharepoint` package).
- `get_channel_messages` takes `team_id` in addition to the planned `channel_id`, because Graph addresses channels within a team.

## GitHub todo list (optional)

GitHub holds all data (issues, assignees, milestones, "blocked by" dependencies, and with a project its `Status` and `Target date`). The app keeps no copy. The project is optional:
- With `GITHUB_ORG` + `GITHUB_PROJECT_NUMBER`, the todo list is that organization project.
- Without it, the todo list is the issues of one repository (`GITHUB_DEFAULT_REPO` unless the user names one); a milestone's due date is the target date, and `status` / `target_date` changes are refused.

| Tool | GitHub calls |
|---|---|
| `list_todos(assignee?, status?, repo?, due_before?, include_closed?, limit?)` | with a project: `GET /orgs/{org}/projectsV2/{n}/fields`, `.../items`; without: `GET /repos/{o}/{r}/issues` (up to 1000 issues, filtered in code) |
| `get_issue(repo, number)` | `GET /repos/{o}/{r}/issues/{n}`, `.../dependencies/blocked_by`, `.../dependencies/blocking`, `.../sub_issues`, `.../comments` (latest 20 of the first 100), project items |
| `propose_issue_changes(changes[])` | reads only: checks issues, assignees (`GET .../assignees/{login}`), milestones (`GET .../milestones`), labels (`GET .../labels`), field names and status options |

Changes (`create_issue`, `update_issue`, `add_comment`, `add_blocker`, `remove_blocker`, `create_milestone`, `update_milestone`) are applied after approval by `applyChanges` (`packages/tools/github/changes.ts`): `POST/PATCH /repos/{o}/{r}/issues`, `POST/DELETE .../labels`, `POST .../comments`, `POST/DELETE .../dependencies/blocked_by`, `POST/PATCH .../milestones`, `POST/PATCH /orgs/{org}/projectsV2/{n}/items` (only with a project).

Approval flow:
1. The tool stores the checked change in `pending_actions` and the run sends an Adaptive Card with **Apply** / **Cancel** (`Action.Execute`).
2. The press arrives as an `adaptiveCard/action` invoke. `AgentService.handleCardAction` resolves the user, claims the proposal, and replaces the card with "Applying…".
3. Changes run in the background with the user's GitHub token; the result is posted as a new message and stored on the row.

Not included: automatic updates without a user request (for example from GitHub webhooks). Those would need a credential that is not tied to one employee. Use the project's built-in workflows (auto-add, close → Done) instead.

## Key decisions

- **Graph tokens via the Bot Framework token service** (Teams SDK `OAuthFlow`). The service stores and refreshes delegated tokens; this app never persists tokens. See [authentication.md](authentication.md).
- **No build step.** Node 24 runs the TypeScript sources directly (type stripping). `tsc` is used for type checking only.
- **Single package, monorepo layout.** Folders follow the planned structure; modules import each other by relative path. Workspaces can be introduced if packages need separate versioning.
- **In-process queue.** Enough for limited concurrency on one server. Open runs are marked `interrupted` on restart and the user is told to resend.
