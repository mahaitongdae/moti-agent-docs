# GitHub todo list setup

Optional. Turns on the GitHub todo list in 1:1 chats, used with each employee's own GitHub account. What employees can do: [usage](../usage/github-todo.md).

Do the [Microsoft Teams setup](microsoft-teams.md) first.

Turned on when any of `GITHUB_REPO_OWNERS`, `GITHUB_DEFAULT_REPO`, `GITHUB_ORG` is set. Each employee signs in with their own GitHub account; GitHub then allows only what both the app and that person may do.

Two ways to keep the todo list:

| | Without a project | With a project |
|---|---|---|
| Settings | `GITHUB_DEFAULT_REPO=owner/name` (and/or `GITHUB_REPO_OWNERS`) | also `GITHUB_ORG` and `GITHUB_PROJECT_NUMBER` |
| Todos | open issues of one repository (default repository unless the user names one) | items of the project, across repositories |
| Target date | due date of the issue's milestone | project `Target date` field |
| Status | open or closed only | project `Status` field |
| Owner | any user or organization | the project must belong to an organization |

## 1. GitHub: GitHub App

Create the app under the account that owns the repositories:
- Organization: organization **Settings** → Developer settings → **GitHub Apps** → **New GitHub App**.
- Personal account (for example `edgeyy`): profile picture → **Settings** → Developer settings → **GitHub Apps** → **New GitHub App**.

| Setting | Value |
|---|---|
| Callback URL | `https://token.botframework.com/.auth/web/redirect` |
| Expire user authorization tokens | **Off** (see "Not yet verified" below) |
| Request user authorization (OAuth) during installation | Off |
| Webhook | **Active** unticked |
| Repository permissions | **Issues**: Read and write. **Metadata**: Read-only (set automatically) |
| Organization permissions | **Projects**: Read and write (only with a project) |
| Where can this GitHub App be installed? | Organization: **Only on this account**. Personal account: **Any account** (see below) |
| After creating: General → Client secrets | **Generate a new client secret**; copy it and the **Client ID** |
| After creating: Install App | install on the account that owns the app; pick the repositories the assistant may use. To use repositories of other owners (`GITHUB_REPO_OWNERS`), set **Any account** above and install the app there too: a GitHub App token only reaches repositories where the app is installed. |

## 2. GitHub: personal repositories

Use the setup without a project, for example `GITHUB_DEFAULT_REPO=edgeyy/tasks`. `GITHUB_REPO_OWNERS` then defaults to `edgeyy`.

- Other people can read private repositories and change issues only as collaborators (repository **Settings** → **Collaborators**). Only the owner and collaborators can be assignees; the assistant checks this before proposing a change.
- Milestones can be created in GitHub (**Issues** → **Milestones**) or by the assistant after approval. Creating one needs write access to the repository.
- Make the app public (app settings → **Advanced** → **Make public**, the same as **Any account**). A private app owned by a personal account can only be authorized by that account; everyone else gets a GitHub 404 page at sign-in. Public only means others can see and install the app on their own accounts; it gives no access to your repositories.
- Projects owned by a personal account are not supported.

## 3. GitHub: project (only with a project)

1. Create an organization project (Projects → New project). Its URL `https://github.com/orgs/<org>/projects/<number>` gives `GITHUB_ORG` and `GITHUB_PROJECT_NUMBER`.
2. Keep the built-in **Status** field (single select). Add a **Date** field named `Target date` (or set `GITHUB_TARGET_DATE_FIELD`).
3. Optional: in the project's **Workflows**, turn on *Auto-add to project* (pick the repositories) and *Item closed → Done*. Then new issues reach the todo list without the assistant.

## 4. Azure Bot: second OAuth connection

Azure Bot → Settings → Configuration → **Add OAuth Connection Settings**:

| Setting | Value |
|---|---|
| Name | `github` (must equal `GITHUB_CONNECTION_NAME`) |
| Service Provider | **GitHub** |
| Client id / Client secret | from the GitHub App |
| Scopes | leave empty (a GitHub App uses its permissions above, not scopes) |

Save, then **Test Connection**. It must end with a token. Verified live: the built-in **GitHub** provider accepts a GitHub App's client id.

| Test Connection problem | Fix |
|---|---|
| GitHub 404 page at `github.com/login/oauth/authorize` | Client id is wrong (it is the `Iv23...` **Client ID**, not the numeric App ID), or the app is private and the browser is signed in to another GitHub account: make the app public |
| Still failing | Use a GitHub **OAuth App** instead (same callback URL, scopes `repo project`). Each token then reaches every repository the user can reach, but the assistant still refuses repositories outside `GITHUB_REPO_OWNERS` |

Not yet verified live:
- Whether the token service refreshes expiring GitHub App tokens. That is why token expiry is turned off above.

## 5. Settings in `.env`

```
GITHUB_DEFAULT_REPO=contoso/tasks      # repository used when the user does not name one
# GITHUB_REPO_OWNERS=contoso           # whose repositories may be used; * for any
# GITHUB_ORG=contoso                   # only with a project
# GITHUB_PROJECT_NUMBER=1              # only with a project
# GITHUB_CONNECTION_NAME=github
```

Restart the agent after changing them. See `.env.example` for all GitHub settings.
