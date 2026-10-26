import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Moti Agent",
  description: "Self-hosted Microsoft Teams assistant powered by Pi",
  base: "/moti-agent-docs/",
  cleanUrls: true,
  head: [["link", { rel: "icon", href: "/moti-agent-docs/logo.svg" }]],
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Setup", link: "/setup/microsoft-teams" },
      { text: "Usage", link: "/usage/microsoft-teams" },
      { text: "Reference", link: "/reference/architecture" },
    ],
    sidebar: [
      {
        text: "Setup",
        items: [
          { text: "Microsoft Teams", link: "/setup/microsoft-teams" },
          { text: "GitHub todo list", link: "/setup/github-todo" },
          { text: "Company skills", link: "/setup/skills" },
          { text: "Deployment", link: "/setup/deployment" },
          { text: "Local debugging", link: "/setup/local-debugging" },
          { text: "Troubleshooting", link: "/setup/troubleshooting" },
        ],
      },
      {
        text: "Usage",
        items: [
          { text: "Microsoft Teams", link: "/usage/microsoft-teams" },
          { text: "GitHub todo list", link: "/usage/github-todo" },
          { text: "Company skills", link: "/usage/skills" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Architecture", link: "/reference/architecture" },
          { text: "Authentication", link: "/reference/authentication" },
          { text: "Security", link: "/reference/security" },
        ],
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
  },
});
