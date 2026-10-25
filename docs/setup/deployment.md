# Deployment

Target: one Linux server with Docker Engine and the Compose plugin. Nothing here depends on a specific cloud.

## Requirements

- A DNS name (`PUBLIC_HOSTNAME`) pointing at the server, ports 80 and 443 open (Let's Encrypt and Teams).
- The admin setup in [Microsoft Teams setup](microsoft-teams.md).
- An LLM provider API key.

## First deployment

```bash
git clone <repo> company-agent && cd company-agent
cp .env.example .env && chmod 600 .env    # fill in values
docker compose --env-file .env -f infra/compose.yaml up -d --build
docker compose --env-file .env -f infra/compose.yaml ps
```

Database migrations run automatically at startup (guarded by an advisory lock). To run them by hand: `docker compose ... run --rm app node packages/database/migrate-cli.ts`.

Services:
- `caddy` — HTTPS termination, automatic certificates, forwards only `/api/messages`.
- `app` — the agent (Node 24), data in the `agentdata` volume (`/data/pi-sessions`).
- `postgres` — PostgreSQL 17, data in the `pgdata` volume.

## Operations

| Task | Command / detail |
|---|---|
| Logs | `docker compose ... logs -f app` — JSON lines (`time`, `level`, `msg`, `runId`, `sessionId`, ...). Rotated by Docker (5 × 20 MB). |
| Liveness | `GET /healthz` inside the network. |
| Readiness | `GET /readyz` checks Postgres; used by the container health check. Not exposed publicly. |
| Shutdown | `SIGTERM`: stops taking work, waits up to 20 s for runs, aborts the rest, closes the database. Runs still open at a crash are marked `interrupted` on next start and the user is told to resend. |
| Upgrade | `git pull && docker compose ... up -d --build`. |
| Block a user | `docker compose ... exec postgres psql -U company_agent -c "UPDATE users SET status='blocked' WHERE entra_object_id='<oid>'"` |
| Usage report | `SELECT u.display_name, sum(total_tokens), sum(cost_usd) FROM usage_records r JOIN users u ON u.id = r.user_id WHERE r.created_at > now() - interval '30 days' GROUP BY 1;` |

## Backup and restore

State lives in two places: PostgreSQL and the `agentdata` volume. Back up both, together.

```bash
infra/backup.sh                      # writes backups/<UTC timestamp>/{postgres.dump,agent-data.tgz,SHA256SUMS}
infra/restore.sh backups/<timestamp> # REPLACES current database and agent data, then restarts the app
```

- The backup dumps the database first, then archives files, so every session file referenced in the dump is present.
- Backups contain conversation content. Store them encrypted and off the server (for example `restic` or `rclone` to company storage), and schedule them with cron or a systemd timer:
  `0 2 * * * cd /opt/company-agent && infra/backup.sh >>/var/log/company-agent-backup.log 2>&1`
- `.env` holds secrets and is not in the backup; keep it in the company secret store.
- The restore procedure is verified by `npm run test:backup` (runs against a throwaway Compose project).

## Moving to another server

No code changes are needed.

1. On the old server: `infra/backup.sh`.
2. On the new server: clone the repo, copy `.env` (same `CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID`, `PUBLIC_HOSTNAME`), copy the backup directory.
3. `docker compose --env-file .env -f infra/compose.yaml up -d --build`, then `infra/restore.sh <backup-dir>`.
4. Point the DNS record of `PUBLIC_HOSTNAME` at the new server. Caddy gets a certificate on first request.
5. Stop the old server.

The Entra app registration, Azure Bot resource, OAuth connection, and Teams app package stay unchanged, so the bot identity and users' sign-ins are preserved. If the hostname must change, update the Azure Bot messaging endpoint and rebuild the Teams app package.

## Local development

Teams must reach your machine over HTTPS. Use a tunnel (for example Microsoft Dev Tunnels) and set the Azure Bot messaging endpoint to the tunnel URL. Full walkthrough: [local-debugging.md](local-debugging.md).

```bash
npm install
npm run test:db:up           # throwaway Postgres on localhost:55432 (also used by tests)
cp .env.example .env         # set DATABASE_URL=postgres://postgres:test@localhost:55432/postgres, DATA_DIR=./data
node --env-file=.env apps/teams-bot/src/main.ts
```
