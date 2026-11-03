# Company skills

Your admins can give the assistant shared rules, for example where files go in SharePoint and how to write them, or what every new GitHub issue must contain. The assistant follows them on its own; if something the rules require is missing, it asks you before proposing a change.

To make the assistant use a skill for one request in a 1:1 chat, start the message with `/skill:` and the skill's name:

```
/skill:github-todo Create an issue for the login bug
```

Ask the assistant which skills it has:

```
Which company skills do you have?
```

## Example: company folders

The `company-files` skill tells the assistant how the company SharePoint library is organized:

```text
Administrative/   policies, purchasing, HR, office
Development/      designs, experiments, technical reports
Shared/           company-wide: announcements, all-hands notes
Templates/        templates for people to use
```

Each of the first three folders has `Todo.md`, `Meetings/`, `Reports/` and `Archive/`. Files are named `YYYY-MM-DD Topic.md` when they have a date.

So you do not need to name a folder:

| You ask | It proposes |
|---|---|
| Write today's notes from the arm calibration meeting | a new file `Development/Meetings/2026-11-01 Arm calibration.md`, filled in from the meeting notes template |
| Add "order parts" for Bob, due Nov 14, to the Development todo list | a new row in `Development/Todo.md` |
| Clean up last year's reports in Development | moving them to `Development/Archive/` instead of deleting them |
| Where should the design review go? | no change; it answers `Development/Reports/` |

If a folder is missing, it creates it in the same proposal. Your company's folders may differ; ask "Where do files go?" to see them.

Admins: see [Company skills setup](../setup/skills.md).
