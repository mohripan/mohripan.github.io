# Ripan's engineering workspace

A dark, rust-accented portfolio and personal project tracker, built with React, TypeScript, and Vite. Published at **https://mohripan.github.io/**.

The professional side covers experience, focus areas, skills, education, awards, and contact details. The project side has search and category filters, repository README views, milestone roadmaps, repository checklist progress, and commits and PRs with automation labels. No application server or database service is required.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

The committed GitHub snapshot lets local development work without GitHub credentials. Open the URL printed by Vite (usually http://127.0.0.1:5173).

## Add or edit a project

Edit `data/projects.json`. A repository link is enough:

```json
[
  "https://github.com/mohripan/flint-graph",
  "https://github.com/mohripan/capsulet"
]
```

Or use an object for presentation and roadmap overrides:

```json
{
  "url": "https://github.com/mohripan/workflow-automations",
  "name": "FlowForge",
  "category": "Workflow engines",
  "summary": "A distributed workflow orchestration system.",
  "tags": ["C# / .NET", "Redis"],
  "roadmapPath": "docs/ROADMAP.md",
  "fallbackAbout": "Used when the README is absent or contains only a title.",
  "enabled": true
}
```

Optional fields: `name`, `category`, `summary`, `tags`, `roadmapPath`, `fallbackAbout`, `status`, and `enabled`. Set `enabled` to `false` to hide a project. Repository URLs must point to public GitHub repositories. The sync refuses private repositories even if your gh session can access them.

After editing project configuration, refresh the local snapshot:

```sh
npm run sync
```

The script uses `GITHUB_TOKEN` when provided, otherwise your existing `gh auth` session, otherwise GitHub's unauthenticated public API. Credentials stay in process memory and never enter the generated JSON or frontend. A failed sync leaves the previous snapshot intact and stops deployment.

## Edit the profile and resume

Update `data/profile.json` for the name, role, company, location, introduction, about paragraphs, hero awards, and contact details. Update `data/resume.json` for the headline numbers, focus areas, experience (each role lists its projects, responsibilities, and stack), skill groups, working strengths, education, and awards. Both files are bundled at build time, so a push is all it takes to publish a change. Harmonix is mapped to the public `HarmonixBenar` repository; its title-only README uses `fallbackAbout`.

## What progress means

Progress is the completion of **tracked work**, not a whole-product estimate. The source is labeled everywhere:

1. When milestones contain issues, show the percentage of closed issues across all fetched milestones.
2. Otherwise, use task lists (`- [ ]`, `- [x]`, `- [~]`) and status tables from `roadmapPath`.
3. Otherwise, show the closed/open repository issue ratio, excluding pull requests.
4. With no tracked items, show development history without a percentage.

GitHub milestone issue counts use GitHub's own values; GitHub can include PRs assigned to milestones. Repository issue counts exclude PRs. A completed checklist is displayed as complete without declaring the product finished. Closed milestone state is respected. Activity shows the latest twelve commits and twelve recently updated PRs per repository; automated authors are labeled and can be hidden. PR activity dates reflect their latest update or merge, not necessarily their creation date.

README Markdown supports tables, fenced code, lists, and images. Relative documentation links resolve to GitHub; relative image paths resolve to the source files. Raw HTML is not rendered.

## Deploy and refresh

The `.github/workflows/deploy.yml` workflow refreshes GitHub data, tests, builds, and deploys on:

- Every push to `main`.
- A manual run from the Actions tab.
- A daily schedule at 23:17 UTC (06:17 in Jakarta the next day; GitHub may delay scheduled jobs).

To update the deployed site, commit and push JSON or frontend changes. To refresh immediately without code changes:

```sh
gh workflow run deploy.yml --repo mohripan/mohripan.github.io
```

Snapshots refreshed during CI are deployed with the site; they are not automatically committed back into source. The committed snapshot is a local development baseline. GitHub may disable scheduled workflows after prolonged repository inactivity; pushes and manual runs still work.

Hosting is GitHub Pages with **Source: GitHub Actions**. For a fork hosted under a project subpath, set `BASE_PATH` for the build in the workflow (for example `/portfolio/`) and update the source repository link in the footer. The default deployment is a user site at the domain root.

## Verify

```sh
npm test
npm run build
npm run preview
```

Tests cover project link validation, configuration, roadmap parsing, progress calculations, and relative README links. TypeScript checking runs as part of the production build. Browser QA covers project filters, dialogs, roadmap switching, activity filters, and mobile navigation.
