# Agent 

How the agent itself is set up: the settings files, which models people can use, how much the models think, and usage limits. Do the [Microsoft Teams setup](microsoft-teams.md) first; its step 4 fills in the Microsoft values described here.

How people choose a model and thinking level: [usage](../usage/microsoft-teams.md). How it works inside: [architecture](../reference/architecture.md#model-choice).

## 1. Settings files

| File | In git | Holds |
|---|---|---|
| `config/agent.yaml` | yes | defaults that are safe to publish. |
| `config/agent.private.yaml` | no | private company values. Override `agent.yaml`. |
| `.env` | no | secrets and container settings. |

The app checks both YAML files at startup and names every unknown key or wrong value. Settings that used to be environment variables (for example `PI_MODEL`) are refused in `.env`, with the key they moved to.

Other sections of the files:

| Section | Page |
|---|---|
| `microsoft`, `teamsApp` | [Microsoft Teams setup](microsoft-teams.md), step 4 |
| `github` | [GitHub todo list setup](github-todo.md) |
| `skillsDir` | [Company skills](skills.md) |
| `logLevel` | `debug`, `info`, `warn` or `error`; see [local debugging](local-debugging.md) |

After changing a YAML file, restart the agent. The private file is mounted into the container, so no rebuild is needed.

## 2. Assign models based on Microsoft Entra Group

Other models can be offered to members of Entra groups. Users choose one per conversation: in Threads from the model menu, in a 1:1 chat with `/model`.

1. Entra admin center → **Groups**: create a **security group**. Copy the group's **Object ID**. 
2. In `config/agent.private.yaml`, list each model with its groups, and add each provider's key to `.env`:

```yaml
models:
  extra:
    - model: anthropic/claude-opus-5-5
      groups:
        - <GROUP_ID>   # Engineering leads
    - model: [openai/gpt-5, deepseek/deepseek-pro]   # several models for the same groups
      groups: [<GROUP_ID>, <OTHER_GROUP_ID>]
      thinking: medium   # default thinking level for these models (step 4)
```

```
# .env
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

3. Restart the agent. It refuses to start if a model is unknown to Pi or its provider has no key.

A model listed in several entries is for the groups of all of them.

Membership is checked with the user's own Microsoft 365 sign-in (`/me/checkMemberGroups`, covered by `User.Read`; no new permission). Until a user has signed in, they see only the default model. Results are kept for 10 minutes, so a change in a group takes up to 10 minutes (or a restart). Before each answer the model is checked again; someone removed from the group gets the default model and a note. All models count toward the same monthly cost limit.

### Subscription login (debugging only)

Pi can also use a subscription login, such as a ChatGPT account for `openai` models, instead of an API key. A subscription is for one person: give its models only to a group that contains just that person. Subscription use has no per-token price, so it does not count toward the monthly cost limit.

1. On your own computer, run Pi (`npx @earendil-works/pi-coding-agent@1.4.0`), enter `/login`, choose **OpenAI (ChatGPT subscription)**, and finish the browser sign-in. Pi saves it in `~/.pi/agent/auth.json`.
2. Copy only that provider's entry into a new file and put it on the server's data volume, readable only by the app:

```bash
jq '{openai: .openai}' ~/.pi/agent/auth.json > auth.json
docker exec -u root company-agent-app-1 mkdir -p /data/pi-auth
docker cp auth.json company-agent-app-1:/data/pi-auth/auth.json
docker exec -u root company-agent-app-1 sh -c 'chown -R node:node /data/pi-auth && chmod 700 /data/pi-auth && chmod 600 /data/pi-auth/auth.json'
rm auth.json
```

3. In `config/agent.private.yaml`: `models.authFile: /data/pi-auth/auth.json`, and a `models.extra` entry such as `model: openai/gpt-6-sol` with your own group. Restart the agent.

   A login in that file is used for every `openai/...` model, even when `OPENAI_API_KEY` is set. So while it is there, give `openai/...` models only to your own group.
4. On your computer, run `/login` again, so your own Pi and the server do not share one login (a refresh by one can end the other's).

Pi refreshes the login in that file by itself; it is the only file Pi writes besides session files. Remove the file and the `models.extra` entry to stop. Not yet verified live.

## 3. Limits

In `config/agent.yaml` (override in the private file if needed):

| Setting | Default | Meaning |
|---|---|---|
| `limits.requestsPerHourPerUser` | 30 | messages per user per hour |
| `limits.costPerMonthPerUserUsd` | 20 | model cost per user per calendar month (UTC), in US dollars. Cost comes from the provider's reported cost or Pi's price list; a model without prices counts as $0 and is not limited. |
| `limits.concurrentAnswers` | 2 | answers produced at the same time |
| `limits.queuedMessages` | 50 | waiting messages before new ones are refused |
| `limits.answerTimeoutSeconds` | 180 | longest time for one answer |
| `limits.toolTimeoutSeconds` | 30 | longest time for one tool call |
