# Company skills setup

Skills are shared instructions for the assistant, written by admins: rules, required fields, templates, and when to ask the user. Every user and every chat uses the same skills. What employees see: [usage](../usage/skills.md).

Do the [Microsoft Teams setup](microsoft-teams.md) first.

## 1. Where skills live

Each skill is a folder with a `SKILL.md` file ([Agent Skills format](https://agentskills.io/specification)):

```text
skills/
└── github-todo/
    ├── SKILL.md
    └── references/        optional supporting files
```

The repository ships `skills/github-todo/SKILL.md`: rules for issues, milestones, and labels on the [GitHub todo list](github-todo.md). Edit it to match your team.

| Setting | Default | Meaning |
|---|---|---|
| `SKILLS_DIR` | `./skills` | Folder that holds the skills. The Docker image copies the repository's `skills/` into the image. |

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
- The assistant's `read` tool reads only files whose real location is inside `SKILLS_DIR`. A symbolic link pointing outside is refused, and a skill whose `SKILL.md` sits outside is not listed.
- A `SKILL.md` without a `description` is not listed.

## 3. Apply changes

Skills are read again for every message, so edits apply to the next message. With Docker, the skills are part of the image: rebuild after editing (or mount a folder and point `SKILLS_DIR` at it):

```bash
docker compose --env-file .env -f infra/compose.yaml up -d --build app
```

Skills are instructions only. They do not grant access: tools, permissions, and the Apply step stay the same.
