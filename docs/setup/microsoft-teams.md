# Microsoft Teams setup

The base setup every feature needs. Steps 1–3 are done by hand in Microsoft portals; none of it can be automated from this repository. Do the steps in order; each one uses values from the previous ones.

Placeholders:
- `<CLIENT_ID>`: Application (client) ID of the app registration
- `<TENANT_ID>`: Directory (tenant) ID
- `<HOST>`: public HTTPS host of the agent (`PUBLIC_HOSTNAME`, or the tunnel host for local debugging)

Why each setting exists is explained in [authentication.md](../reference/authentication.md).

Models, thinking levels and limits: [Agent settings](agent-settings.md). The optional [GitHub todo list](github-todo.md) builds on this setup. Problems: [troubleshooting.md](troubleshooting.md). Daily use: [usage](../usage/microsoft-teams.md).

## 1. Entra admin center: app registration

Entra admin center → **App registrations** → **New registration**.

| Where | Setting | Value |
|---|---|---|
| New registration | Supported account types | **Accounts in this organizational directory only** |
| Overview | Application (client) ID | copy → `config/agent.private.yaml` `microsoft.clientId` |
| Overview | Directory (tenant) ID | copy → `config/agent.private.yaml` `microsoft.tenantId` and `microsoft.allowedTenantIds` |
| Certificates & secrets | New client secret | copy the **Value** → `.env` `CLIENT_SECRET`. Note the expiry date. |
| Authentication → Add a platform → **Web** | Redirect URI | `https://token.botframework.com/.auth/web/redirect` |

### Expose an API (Teams single sign-on)

| Setting | Value |
|---|---|
| Application ID URI | `api://<HOST>/botid-<CLIENT_ID>`. The portal suggests `api://<CLIENT_ID>`; change it. The host part is needed for the Threads tab's sign-in. If saving fails with "must contain a tenant verified domain" (a tunnel host), first open **Manifest**, set `"requestedAccessTokenVersion": 2` under `"api"` (older format: `"accessTokenAcceptedVersion": 2`), save, then set the URI. |
| Add a scope | Name `access_as_user`; who can consent: **Admins and users**; state: **Enabled**. Display names and descriptions are free text. |
| Add a client application | `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams desktop and mobile), tick `access_as_user` |
| Add a client application | `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web), tick `access_as_user` |

### API permissions

Add a permission → **Microsoft Graph** → **Delegated permissions**:

- `User.Read`, `openid`, `profile`, `offline_access`
- `Files.Read.All`, `Sites.Read.All`
- `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`
- `Mail.ReadWrite`, `Mail.Send`, `MailboxSettings.ReadWrite`

Then click **Grant admin consent for \<tenant\>**. Do not add any application permissions.

## 2. Azure portal: Azure Bot

Azure portal → **Create a resource** → **Azure Bot**.

| Where | Setting | Value |
|---|---|---|
| Create | Type of App | **Single Tenant** |
| Create | Creation type | **Use existing app registration**: `<CLIENT_ID>`, `<TENANT_ID>`. Do not let Azure create a new app id. |
| Create | Pricing tier | F0 (free) is enough |
| Settings → Configuration | Messaging endpoint | `https://<HOST>/api/messages` |
| Settings → Channels | Add channel | **Microsoft Teams** |

### OAuth connection

Settings → Configuration → **Add OAuth Connection Settings**:

| Setting | Value |
|---|---|
| Name | `graph` (must equal `microsoft.graphConnection` in `config/agent.yaml`) |
| Service Provider | **Azure Active Directory v2** (may be shown as Microsoft Entra ID v2) |
| Client id | `<CLIENT_ID>` |
| Client secret | the client secret value |
| Token Exchange URL | `api://<HOST>/botid-<CLIENT_ID>`, exactly as the Application ID URI |
| Tenant ID | `<TENANT_ID>` |
| Scopes | `User.Read Files.Read.All Sites.Read.All Team.ReadBasic.All Channel.ReadBasic.All ChannelMessage.Read.All Mail.ReadWrite Mail.Send MailboxSettings.ReadWrite offline_access openid profile` (space separated) |

Save, open the connection again, and click **Test Connection**. It must end with a token. Do not share or paste that token anywhere.

## 3. Teams admin center: app upload

Build the package (after step 4, from the repository root). It reads `microsoft.clientId` and `teamsApp.companyName` from the settings files:

```bash
PUBLIC_HOSTNAME=<HOST> infra/teams-app/package.sh moti-agent.zip
```

| Where | Setting |
|---|---|
| Teams apps → Setup policies → Global (or a test policy) | **Upload custom apps**: On (needed for a personal trial upload) |
| Teams apps → Manage apps → **Upload new app** | upload `moti-agent.zip` for the whole organization |
| Teams apps → Permission policies | allow the app for the users who should have it |
| Teams apps → Setup policies → Installed / Pinned apps | optional: install or pin it for users |

After the org upload, employees find the app in Teams → Apps → **Built for your org** and click Add; no zip needed. With a setup policy it is installed (and optionally pinned) for them automatically. Assign the policy to a few users first for a small pilot.

For a personal trial, a user can instead upload the zip in the Teams client: Apps → Manage your apps → **Upload a custom app**.

The zip holds only what Teams shows before it talks to the server:

| File | Contents |
|---|---|
| `manifest.json` | `infra/teams-app/manifest.json` with `<CLIENT_ID>`, `<HOST>` and the company name filled in: app name, descriptions, bot id, command menu (`/new`, `/cancel`, `/model`, `/thinking`, `/signout`, `/help`), Threads tab URL, allowed domains, tab sign-in resource |
| `color.png`, `outline.png` | app icons |

Everything else comes from the server, so most changes need no new zip:

| Change | New zip? |
|---|---|
| Agent code: replies, cards, tools, skills, the Threads tab page itself | No, rebuild and restart the server |
| `.env` and `config/*.yaml` settings other than `PUBLIC_HOSTNAME`, `microsoft.clientId` and `teamsApp.companyName` | No, restart the server |
| Azure Bot messaging endpoint, OAuth connection scopes | No |
| App name, descriptions, icons, company name | Yes |
| Command menu or tabs in `manifest.json` | Yes |
| `<CLIENT_ID>` (a new app registration) | Yes |
| `<HOST>` (server address) | Yes; also change the Application ID URI and Token Exchange URL (steps 1 and 2) and `PUBLIC_HOSTNAME`. Chat follows the messaging endpoint, but the Threads tab and its sign-in use `<HOST>`. |

To update: increase `"version"` in `infra/teams-app/manifest.json` (Teams needs a higher version to update the app), rebuild the zip, and in Manage apps open the app → **Update**. Installed copies update automatically. For a personal trial upload, upload the new zip the same way as the first one.

## 4. Agent settings

Create `config/agent.private.yaml` and `.env` as in [Agent settings](agent-settings.md) (files, models, limits). The values from steps 1–3:

```yaml
# config/agent.private.yaml
microsoft:
  tenantId: <TENANT_ID>
  clientId: <CLIENT_ID>
  allowedTenantIds: [<TENANT_ID>]   # users from other tenants get no answer
teamsApp:
  companyName: Your company
models:
  default: anthropic/claude-sonnet-5-5
```

```
# .env
PUBLIC_HOSTNAME=<HOST>               # also the Threads tab sign-in audience
CLIENT_SECRET=...
ANTHROPIC_API_KEY=...
```

Then start the agent: [deployment.md](deployment.md) for a server, [local-debugging.md](local-debugging.md) on your own machine.

## 5. Network

- `<HOST>` must be reachable from the internet over HTTPS at all times. With a local tunnel, the bot stops receiving messages as soon as the tunnel stops.
- Quick check: `curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<HOST>/api/messages` must print `401` (reached the bot, rejected because the request is not from Teams).
- Azure Bot → **Test in Web Chat**: send any text. The bot does not answer Web Chat, but the app log must show `ignored unsupported activity` with `channelId: webchat`. That proves Azure delivers to the messaging endpoint.
- After changing the messaging endpoint, messages sent before the change went to the old address and are lost. Send a new message.

## What each part uses

| Part | Settings |
|---|---|
| Chat | step 1 app registration, step 2 Azure Bot, step 3 Teams app |
| Files | step 1 API permissions `Files.Read.All`, `Sites.Read.All` and Expose an API (silent sign-in); step 2 OAuth connection `graph` with those scopes |
| Threads tab | step 1 Expose an API with `<HOST>` in the Application ID URI and both Teams client applications; step 3 package built with the same `<HOST>`; `.env` `PUBLIC_HOSTNAME`. Sign-in for the tab's tool calls comes from the chat (step 2). The token setup was verified live with the History tab (version 0.3.0); the Threads page itself is not yet verified live. |
| Channel summaries | step 1 API permissions `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`; step 2 OAuth connection `graph` with those scopes; app added to each team where people `@mention` it |
| Mail | step 1 API permissions `Mail.ReadWrite` (read, drafts, flags, folders), `Mail.Send` (send, reply, forward), `MailboxSettings.ReadWrite` (automatic replies); step 2 OAuth connection `graph` with those scopes. Each user's own mailbox only, in 1:1 chats; every change waits for the user's Apply. Leave out `Mail.Send` or `MailboxSettings.ReadWrite` to turn that part off. |

Turning off a part means removing its permissions and scopes; the assistant then answers that sign-in or access is missing.
