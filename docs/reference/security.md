# Security

Security is enforced in code. The system prompt only gives behavioural guidance.

## Controls

| Requirement | Implementation |
|---|---|
| Authentic requests | Teams SDK JWT validation; `DANGEROUSLY_ALLOW_UNAUTHENTICATED_REQUESTS` is refused when `NODE_ENV=production`, and production requires bot credentials. Caddy exposes only `/api/messages`. |
| User identification | Tenant id + Entra object id from the validated activity (`packages/auth/entra/identity.ts`). |
| Tenant allowlist | `ALLOWED_TENANT_IDS`. Other tenants get no reply; the attempt is audited. |
| User blocking | `UPDATE users SET status = 'blocked' WHERE entra_object_id = '...'`. |
| Session isolation | Personal sessions are keyed and checked by owner; channel sessions belong to the channel thread (`packages/auth/permissions/policy.ts`, `packages/agent/sessions/`). Ownership is re-checked when a queued run starts. |
| Per-call authorization | Every tool call is re-validated against its schema and authorized for the actor, session, and arguments before any Graph call (`packages/tools/registry.ts`). |
| Least privilege | Delegated Graph permissions only, read-only Microsoft 365 tools, no app-only permissions. Shared sessions get only current-channel reads; group chats get no tools. GitHub tools exist only in 1:1 chats and only for repositories owned by `GITHUB_REPO_OWNERS` (default `GITHUB_ORG`, else the owner of `GITHUB_DEFAULT_REPO`; `*` turns the check off and leaves only GitHub's own permissions). |
| Approval for changes | The model cannot write. `propose_issue_changes` validates the change with the user's GitHub token and stores it in `pending_actions`. Code applies it only when the same user presses **Apply** on the card; the claim is a single conditional `UPDATE` (owner, `pending`, not expired), so each proposal is claimed at most once. Write requests are not automatically retried on server errors or dropped connections; their outcome may be uncertain and must be checked on GitHub before proposing again. Other users, expired (30 min) or already decided proposals are refused and audited (`packages/agent/proposals.ts`). |
| No shell / filesystem | Pi runs with an explicit tool allowlist; built-in coding tools are never enabled, and the app aborts the run if any unexpected tool appears. |
| Secrets | Graph and GitHub tokens stay in the Bot Framework token service and app memory. Secrets come from environment variables; `.env` is git-ignored. Tokens are never put in prompts, transcripts, logs, or audit records. |
| Untrusted content | Tool output is wrapped in `<untrusted_content>` and the model is told to treat it as data. Injected instructions cannot change data on their own: the only write path is a proposal the user must approve on a card that shows the complete preview, including new issue bodies as plain text. Proposals too large for a card are rejected and must be split. |
| Input validation | Ids are pattern-checked (`driveId:itemId`, GUID team ids, `19:…@thread.*` channel ids) and URL-encoded. Paging links are followed only if they point at the Graph base URL. Content downloads follow Graph's pre-authenticated redirect without sending the user's token. |
| Information leaks | Graph 403 and 404 return the same message. Internal errors are logged, not shown to users or the model. |
| Audit | `tool_invocations` (tool, arguments, status, duration, result size — not content) and `audit_events` (access denied, sessions, sign-in, limits, cancellations, identity mismatch). |
| Limits | Per-user requests per hour and tokens per day; global concurrency and queue size; run and tool timeouts. |
| Duplicate deliveries | `inbound_activities` primary key on (tenant, conversation, activity id). |
| Data at rest | Pi transcripts contain conversation content and retrieved excerpts. They live in the `agentdata` volume, created with `umask 077`. Encrypt the server disk and the backups. |

## Known limits (MVP)

- Prompt injection can still affect what the assistant says, and can make it propose GitHub changes. Those changes still need the user to read the card and press Apply.
- Content shared in a channel thread is visible to anyone in that thread, by design.
- Rate limits are per user, not per tenant or team.
- Audit and usage tables have no retention policy yet; prune them according to company policy.
