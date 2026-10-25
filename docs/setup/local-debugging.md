# Local debugging with real Teams

Run the agent on your own machine against a real Microsoft 365 tenant, with Teams reaching it through an HTTPS tunnel. Use this to check changes before deploying them to the server with [deployment.md](deployment.md).

Use a separate app registration and Azure Bot for local debugging. An Azure Bot has one messaging endpoint; pointing the production bot at your machine takes it offline for everyone.

## Prerequisites

- A Microsoft 365 tenant where you can grant admin consent and upload custom Teams apps.
- An Azure subscription for the Azure Bot resource (the free F0 tier is enough).
- An LLM provider API key (for example Anthropic).
- Docker and Node.js 24 on your machine.

## 1. Open an HTTPS tunnel

Run the tunnel on the same machine as the agent, using Microsoft Dev Tunnels with a named tunnel so the URL stays the same across restarts:

```bash
curl -sL https://aka.ms/DevTunnelCliInstall | bash
devtunnel user login -g -d                 # GitHub device-code login (see note below)
devtunnel create <name> -a                 # -a: anonymous access, Teams must reach it directly
devtunnel port create <name> -p 3978
devtunnel host <name>                      # note the https://xxxx-3978.xxx.devtunnels.ms URL
```

- Tunnel names are global; if `create` reports `Conflict with existing entity`, pick another name.
- On a machine without a browser, Microsoft-account device-code login (`devtunnel user login -d`) can be blocked by Entra security defaults (error `530035`). GitHub login (`-g`) avoids that.
- Below, the tunnel URL is `<TUNNEL>`. ngrok or a similar tool also works.

The tunnel must stay up; when it stops, Teams messages are lost. To keep it running after the terminal closes, run it as a systemd user service:

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/devtunnel-agent.service <<'UNIT'
[Unit]
Description=Dev tunnel for the Teams agent
After=network-online.target

[Service]
ExecStart=%h/bin/devtunnel host <name>
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
UNIT
systemctl --user daemon-reload
systemctl --user enable --now devtunnel-agent.service
loginctl enable-linger "$USER"             # keep user services running after logout
journalctl --user -u devtunnel-agent -f    # logs
```

If the devtunnel login expires, the service keeps failing to reconnect; run `devtunnel user login -g -d` again.

## 2. Configure Entra and the Azure Bot

Follow steps 1 and 2 of [Microsoft Teams setup](microsoft-teams.md), with `<HOST>` = the tunnel host. The Azure Bot messaging endpoint is `<TUNNEL>/api/messages`. Finish with a successful **Test Connection**.

## 3. Start the agent locally

```bash
npm install
npm run test:db:up            # throwaway Postgres; data is lost when it stops, fine for debugging
cp .env.example .env
```

In `.env`, set the agent settings from step 4 of [Microsoft Teams setup](microsoft-teams.md), plus:

```
DATABASE_URL=postgres://postgres:test@localhost:55432/postgres
DATA_DIR=./data
LOG_LEVEL=debug
```

`PUBLIC_HOSTNAME` and `POSTGRES_PASSWORD` are only used by Docker Compose and can be left as they are. Then start:

```bash
node --env-file=.env apps/teams-bot/src/main.ts
```

## 4. Package and upload the Teams app

```bash
CLIENT_ID=<CLIENT_ID> PUBLIC_HOSTNAME=<tunnel host, without https://> COMPANY_NAME="Your company" \
  infra/teams-app/package.sh moti-agent.zip
```

Teams client → Apps → Manage your apps → **Upload a custom app**, then choose the zip. If the option is missing, turn on "Upload custom apps" in a Teams admin center setup policy.

## 5. Check it works

1. In a 1:1 chat with the bot, send `Hello, what can you do?`. Pi should reply.
2. In the 1:1 chat, ask `Which teams am I in?`. The first time, Teams signs you in silently (SSO) or shows a sign-in card; then the bot lists your teams.
3. In the 1:1 chat, ask `Find the latest ... report in OneDrive and summarize it`.
4. Add the app to a team. In a channel, `@Moti Agent Summarize the major decisions in this channel this week`.
5. Permission check with two accounts: put a file only user A can open, then have user B ask for it (also by explicit file id). B must not get it.

## Troubleshooting

See [troubleshooting.md](troubleshooting.md).

## Notes

- The terminal prints JSON logs; keep them for debugging.
- To check only that the bot replies, you can skip Expose an API, API permissions, and the OAuth connection. Check 1 then works; the others answer that sign-in is required.
