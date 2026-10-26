# Troubleshooting

Errors seen during the first test with real Teams. Steps refer to [Microsoft Teams setup](microsoft-teams.md).

| Symptom | Cause | Fix |
|---|---|---|
| Bot answers, but no sign-in card; app log `sign-in prompt failed`, `Could not find Connection Setting with name graph` | OAuth connection missing or named differently | Step 2 OAuth connection, on the Azure Bot whose app id is `<CLIENT_ID>` |
| Test Connection: `AADSTS500113: No reply address is registered for the application` | Redirect URI missing | Step 1, Authentication → Web redirect URI |
| Sign-in card sent, then `Microsoft 365 sign-in did not complete`; app log `invokeerror` / `resourcematchfailed` | Expose an API missing or Application ID URI does not match the Token Exchange URL | Step 1, Expose an API |
| Threads tab is blank or says "Could not sign you in to this tab" | Application ID URI, the package's `webApplicationInfo.resource` and `PUBLIC_HOSTNAME` do not use the same host | Step 1, Expose an API; rebuild the package |
| Threads tab: `invalid_resource`, `AADSTS500011` | the Application ID URI was not saved, or it differs from the package's `webApplicationInfo.resource` | Step 1, Expose an API; check the URI on that page |
| Threads tab: "The operation attempted is invalid" (Tag `49dvr`) | Teams client applications are not pre-authorized | Step 1, add both client applications with `access_as_user` |
| Saving the Application ID URI: "must contain a tenant verified domain" | tenant policy; the host is not a verified domain | Step 1: set `requestedAccessTokenVersion` to `2` in the app's Manifest first |
| Threads tab says "Open this page from the assistant's Threads tab" | the page was opened outside Teams | open it from the app's Threads tab |
| Threads answer stays on the dots, then shows the whole answer at once | a proxy buffers `/api/threads/send` | Caddy: keep `flush_interval -1` for that path (`infra/Caddyfile`); no compression on it |
| No reply at all; nothing new in the app log | Teams cannot reach `<HOST>` (tunnel stopped, wrong messaging endpoint) | Step 5 |
| Dev tunnel login: error `530035` | Entra security defaults block device-code login | Log in to devtunnel with GitHub (`-g`); see [local-debugging.md](local-debugging.md) |
| Error mentions the app id or tenant | `microsoft.clientId` differs between `config/agent.private.yaml`, Azure Bot, OAuth connection, or Teams package | Use one app registration everywhere |

GitHub sign-in problems: see the notes at the end of [GitHub todo list setup](github-todo.md).

## Maintenance

- The client secret (Microsoft Teams setup step 1) expires. Before it does: create a new secret, update `.env` `CLIENT_SECRET` **and** the OAuth connection's client secret, restart the app, then delete the old secret.
- Moving to another server keeps all of the above unchanged if `<HOST>` stays the same. See [deployment.md](deployment.md).
