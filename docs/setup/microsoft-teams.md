# Microsoft Teams setup

The base setup every feature needs. Steps 1–3 are done by hand in Microsoft portals; none of it can be automated from this repository. Do the steps in order; each one uses values from the previous ones.

Placeholders:
- `<CLIENT_ID>`: Application (client) ID of the app registration
- `<TENANT_ID>`: Directory (tenant) ID
- `<HOST>`: public HTTPS host of the agent (`PUBLIC_HOSTNAME`, or the tunnel host for local debugging)

Why each setting exists is explained in [authentication.md](../reference/authentication.md).

The optional [GitHub todo list](github-todo.md) builds on this setup. Problems: [troubleshooting.md](troubleshooting.md). Daily use: [usage](../usage/microsoft-teams.md).

## 1. Entra admin center: app registration

Entra admin center → **App registrations** → **New registration**.

| Where | Setting | Value |
|---|---|---|
| New registration | Supported account types | **Accounts in this organizational directory only** |
| Overview | Application (client) ID | copy → `.env` `CLIENT_ID` |
| Overview | Directory (tenant) ID | copy → `.env` `TENANT_ID` and `ALLOWED_TENANT_IDS` |
| Certificates & secrets | New client secret | copy the **Value** → `.env` `CLIENT_SECRET`. Note the expiry date. |
| Authentication → Add a platform → **Web** | Redirect URI | `https://token.botframework.com/.auth/web/redirect` |

### Expose an API (Teams single sign-on)

| Setting | Value |
|---|---|
| Application ID URI | `api://botid-<CLIENT_ID>`. The portal suggests `api://<CLIENT_ID>`; change it. |
| Add a scope | Name `access_as_user`; who can consent: **Admins and users**; state: **Enabled**. Display names and descriptions are free text. |
| Add a client application | `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams desktop and mobile), tick `access_as_user` |
| Add a client application | `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web), tick `access_as_user` |

### API permissions

Add a permission → **Microsoft Graph** → **Delegated permissions**:

- `User.Read`, `openid`, `profile`, `offline_access`
- `Files.Read.All`, `Sites.Read.All`
- `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`

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
| Name | `graph` (must equal `.env` `GRAPH_CONNECTION_NAME`) |
| Service Provider | **Azure Active Directory v2** (may be shown as Microsoft Entra ID v2) |
| Client id | `<CLIENT_ID>` |
| Client secret | the client secret value |
| Token Exchange URL | `api://botid-<CLIENT_ID>`, exactly as the Application ID URI |
| Tenant ID | `<TENANT_ID>` |
| Scopes | `User.Read Files.Read.All Sites.Read.All Team.ReadBasic.All Channel.ReadBasic.All ChannelMessage.Read.All offline_access openid profile` (space separated) |

Save, open the connection again, and click **Test Connection**. It must end with a token. Do not share or paste that token anywhere.

## 3. Teams admin center: app upload

Build the package:

```bash
CLIENT_ID=<CLIENT_ID> PUBLIC_HOSTNAME=<HOST> COMPANY_NAME="Your company" \
  infra/teams-app/package.sh moti-agent.zip
```

| Where | Setting |
|---|---|
| Teams apps → Setup policies → Global (or a test policy) | **Upload custom apps**: On (needed for a personal trial upload) |
| Teams apps → Manage apps → **Upload new app** | upload `moti-agent.zip` for the whole organization |
| Teams apps → Permission policies | allow the app for the users who should have it |
| Teams apps → Setup policies → Installed / Pinned apps | optional: install or pin it for users |

After the org upload, employees find the app in Teams → Apps → **Built for your org** and click Add; no zip needed. With a setup policy it is installed (and optionally pinned) for them automatically. Assign the policy to a few users first for a small pilot.

For a personal trial, a user can instead upload the zip in the Teams client: Apps → Manage your apps → **Upload a custom app**.

Updates:
- Changing the server address needs no new package; Teams follows the Azure Bot messaging endpoint.
- After changing the app name, icons, descriptions, or `<CLIENT_ID>`: increase `"version"` in `infra/teams-app/manifest.json`, rebuild the zip, and in Manage apps open the app → **Update**. Installed copies update automatically.

## 4. Agent settings

In `.env` (see `.env.example` for all settings):

```
CLIENT_ID=<CLIENT_ID>
CLIENT_SECRET=...
TENANT_ID=<TENANT_ID>
ALLOWED_TENANT_IDS=<TENANT_ID>        # users from other tenants get no answer
PI_PROVIDER=anthropic
PI_MODEL=claude-sonnet-5-5
ANTHROPIC_API_KEY=...
```

Any provider and model in Pi's built-in catalog works. `PI_API_KEY` overrides the provider's standard key variable.

Optional limits (defaults shown):

| Setting | Default | Meaning |
|---|---|---|
| `USER_MAX_REQUESTS_PER_HOUR` | 30 | messages per user per hour |
| `USER_MAX_TOKENS_PER_DAY` | 1000000 | LLM tokens per user per day |
| `AGENT_MAX_CONCURRENCY` | 2 | answers produced at the same time |
| `AGENT_MAX_QUEUE` | 50 | waiting messages before new ones are refused |
| `AGENT_RUN_TIMEOUT_MS` | 180000 | longest time for one answer |

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
| Channel summaries | step 1 API permissions `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`; step 2 OAuth connection `graph` with those scopes; app added to each team where people `@mention` it |

Turning off a part means removing its permissions and scopes; the assistant then answers that sign-in or access is missing.
