# Company skills setup

Skills are shared instructions for the assistant, written by admins: rules, required fields, templates, and when to ask the user. Every user and every chat uses the same skills. What employees see: [usage](../usage/skills.md).

Do the [Microsoft Teams setup](microsoft-teams.md) first.

## 1. Where skills live

Each skill is a folder with a `SKILL.md` file ([Agent Skills format](https://agentskills.io/specification)):

```text
skills/
└── company-files/
    ├── SKILL.md
    └── templates/         optional supporting files, read by the assistant on demand
```

The repository ships two skills. Edit them to match your team.

| Skill | Rules for |
|---|---|
| `skills/company-files/SKILL.md` | the folders in the company SharePoint library (`Administrative`, `Development`, `Shared`, `Templates`; the first three each with `Todo.md`, `Meetings/`, `Reports/`, `Archive/`), file names, writing style, and todo lists (a Markdown table with columns Item, Owner, Due, Status, Notes). Templates for new files are in `skills/company-files/templates/`; add a file there and a row to the skill's Templates table for each new one, and put a copy in the library's `Templates/` so people can see it. Word and Excel templates go only in `Templates/`; the assistant copies them. Set `microsoft.companySite` ([Microsoft Teams setup, step 4](microsoft-teams.md#_4-agent-settings)) so the assistant can use these paths. Create the folders in SharePoint yourself, or ask the assistant to propose them. |
| `skills/github-todo/SKILL.md` | issues, milestones, and labels on the [GitHub todo list](github-todo.md) |

| Setting | Default | Meaning |
|---|---|---|
| `skillsDir` (in `config/agent.yaml`) | `./skills` | Folder that holds the skills. The Docker image copies the repository's `skills/` into the image. |

## 2. Write a skill

```markdown
---
name: github-todo
description: Team rules for GitHub issues and milestones. Load before proposing any GitHub change.
---

# Rules
...
```

- `name`: lowercase letters, digits, and hyphens. In a 1:1 chat, users can type `/skill:<name>`.
- `description`: when to use the skill. As in Pi, every chat lists each skill's name, description, and file location; the assistant reads the full `SKILL.md` only when a task matches. State both what the skill covers and when it applies.
- `disable-model-invocation: true` hides a skill from the assistant; only `/skill:<name>` then uses it.
- Supporting files (up to 100 KB) are referred to by their path relative to the skill folder, e.g. `references/template.md`.
- The assistant's `read` tool reads only files whose real location is inside `skillsDir`. A symbolic link pointing outside is refused, and a skill whose `SKILL.md` sits outside is not listed.
- A `SKILL.md` without a `description` is not listed.

## 3. Apply changes

Skills are read again for every message, so edits apply to the next message. With Docker, the skills are part of the image: rebuild after editing (or mount a folder and point `skillsDir` at it):

```bash
docker compose --env-file .env -f infra/compose.yaml up -d --build app
```

Skills are instructions only. They do not grant access: tools, permissions, and the Apply step stay the same.
