# Authentication

How users are identified and how the agent gets access to Microsoft 365. Portal settings are in [Microsoft Teams setup](../setup/microsoft-teams.md).

## How identity and access work

| Question | Answer |
|---|---|
| Is the request really from Teams? | The Teams SDK validates the Bot Framework JWT on every request (fails closed without credentials). |
| Who is the user? | `conversation.tenantId` + `from.aadObjectId` (Entra object id) from the validated activity. Mapped to a row in `users`. |
| May they use the agent? | Tenant must be in `microsoft.allowedTenantIds`; user `status` must be `active`. |
| May they read a file or channel? | Only through Microsoft Graph with **their own delegated token**. Graph enforces their real Microsoft 365 permissions. |

A Teams message alone never grants Microsoft 365 access:
- Graph tokens come from the user's own Entra sign-in (OAuth connection on the Azure Bot).
- Before a token is used, the app calls `GET /me` and requires the returned id to equal the sender's Entra object id. A mismatch signs the user out and is audited (`identity_mismatch`).
- No application (app-only) Graph permissions are used. There are no shared admin credentials for employee requests.

### Token lifecycle

- Tokens are stored and refreshed by the Bot Framework token service. This app keeps them only in memory (at most 5 minutes) and never writes them to Postgres, logs, or Pi transcripts.
- On Graph `401`, the app fetches the token again and retries once. If the token service returns the same rejected token, the user is signed out and asked to sign in again.
- `oauth_connections` records only status: `connected`, `sign_in_required`, `identity_mismatch`.

### GitHub (optional)

- GitHub tokens come from the user's own GitHub sign-in: a second OAuth connection (`github.connection`) on the same Azure Bot. They are stored and kept by the Bot Framework token service, keyed by Teams user and connection, exactly like Graph tokens. This app keeps them in memory for at most 5 minutes and never writes them anywhere.
- GitHub enforces the user's own repository and project permissions. There is no shared GitHub credential.
- There is no automatic link between the Entra account and the GitHub account; whoever completes the GitHub sign-in from that Teams user's card is the GitHub identity for that user.
- In code, only the project of `github.project.org` (when set) and repositories owned by `github.repoOwners` are allowed. The default is `github.project.org`, else the owner of `github.defaultRepo`; `*` allows any repository the user's token can reach.
- On GitHub `401` the app fetches the token again and retries once, then asks the user to sign in again.
- `oauth_connections` records the status for the `github` connection too.

### Threads tab

- The tab page asks Teams for an SSO token for `api://<HOST>/botid-<CLIENT_ID>` (`webApplicationInfo.resource` in the manifest). Teams desktop, mobile, and web are pre-authorized client applications, so no consent prompt is shown.
- The Teams SDK checks the token's signature and audience; the app then requires the token's tenant to be in `microsoft.allowedTenantIds` and its object id to belong to an existing, active user.
- The token is used only to identify the user. It is not exchanged for Graph access and not stored. Tools run with the tokens the user gave in the chat (Bot Framework token service, keyed by Teams user). When one is missing, the sign-in card is sent into the user's 1:1 chat; the tab itself never signs anyone in.
- When the host in the URI is not a verified domain of the tenant (for example a dev tunnel), the tenant's default policy rejects the URI unless the app registration issues v2 access tokens (`requestedAccessTokenVersion: 2`). The SDK accepts v1 and v2 tokens.
- The same Application ID URI serves the bot's silent sign-in, so it must equal the OAuth connection's Token Exchange URL.

### Sign-in experience

- Sign-in is requested only when a tool needs Microsoft 365, and only in 1:1 chats (OAuth cards in channels are not supported for this). With SSO configured, Teams completes it silently.
- In the Threads tab, a question that needs a sign-in sends the sign-in card to the user's 1:1 chat, and the answer says so.
- In channels, users who are not signed in are told to message the bot directly once.
- `/signout` disconnects the user's Microsoft 365 connection.
