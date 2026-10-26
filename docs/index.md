---
layout: home

hero:
  name: Moti Agent
  text: Your AI assistant in Microsoft Teams
  tagline: Self-hosted, powered by Pi. It works with each employee's own Microsoft 365 permissions and never writes to Microsoft 365.
  image:
    src: /logo.svg
    alt: Moti Agent
  actions:
    - theme: brand
      text: Setup
      link: /setup/microsoft-teams
    - theme: alt
      text: Usage
      link: /usage/microsoft-teams
    - theme: alt
      text: How it works
      link: /reference/architecture

features:
  - icon: 💬
    title: Chat in Teams
    link: /usage/microsoft-teams
    details: Message it 1:1 or @mention it in a channel. Replies stream in as they are written.
  - icon: 📁
    title: OneDrive and SharePoint
    details: Search, read, and summarize files, including Word, Excel, PowerPoint, and PDF.
    link: /usage/microsoft-teams#files
  - icon: 🗂️
    title: Channel summaries
    details: Summarize Teams channel discussions, with decisions and action items called out.
    link: /usage/microsoft-teams#channel-summaries
  - icon: ✅
    title: GitHub todo list
    link: /usage/github-todo
    details: Optional. Track issues with owners, target dates, and dependencies. Every change waits for your Apply.
  - icon: 📘
    title: Company skills
    link: /usage/skills
    details: Shared rules and templates, such as what every issue must contain. The assistant asks when something is missing.
  - icon: 🔒
    title: Your permissions only
    details: Every request uses the employee's own sign-in. Nobody sees a file or channel they could not open themselves.
  - icon: 🏠
    title: Self-hosted
    details: One Docker Compose stack with HTTPS, health checks, logs, and backup/restore on your own server.
  - icon: 🧩
    title: Ready to extend
    details: New tools plug into one registry with input checks, permission checks, and an audit log.
---

<div class="path">

## Setup at a glance

Each step in the guides comes with a screenshot of the screen you should see.

<div class="path-steps">
  <div class="path-step">
    <h3>Register the app</h3>
    <p>Entra admin center: app registration, sign-in, and Graph permissions.</p>
    <Screenshot caption="Entra app registration" />
  </div>
  <div class="path-step">
    <h3>Create the Azure Bot</h3>
    <p>Azure portal: bot resource, messaging endpoint, and sign-in connection.</p>
    <Screenshot caption="Azure Bot configuration" />
  </div>
  <div class="path-step">
    <h3>Start the agent</h3>
    <p>Fill in <code>.env</code> and start it locally or with Docker Compose.</p>
    <Screenshot caption="Agent running" />
  </div>
  <div class="path-step">
    <h3>Add it to Teams</h3>
    <p>Upload the app package and send your first message.</p>
    <Screenshot caption="First chat in Teams" />
  </div>
</div>

</div>
