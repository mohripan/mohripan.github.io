# Ripan's engineering workspace

A public React/TypeScript portfolio hosted on GitHub Pages. The audience is hiring managers, engineers, collaborators, and people interested in Ripan's projects. It has two jobs: present Ripan's professional experience, and make the development of his personal projects visible.

## Experience

Dark workspace with rust-red accents, readable warm-white text, and restrained borders. Space Grotesk for headings, DM Sans for body text, and IBM Plex Mono for metadata. Palette: charcoal #17181b, panel #202125, border #34353b, warm white #ecebe7, muted gray #aaabb3, rust #e98b68. Signature: a project delivery trace inspired by graph and workflow execution, paired with real roadmap tasks.

Page order: hero (name, role, awards, and the featured build on the workbench), impact numbers, experience (focus areas plus a role timeline whose company column stays pinned while its projects scroll), personal projects, roadmap, activity, skills, education and awards, and about/contact. Responsive navigation, project category filters, search, overview/roadmap/activity project dialogs, and progress summaries.

## Data

`data/profile.json` holds identity, introduction, and contact details. `data/resume.json` holds the experience, skills, strengths, education, and awards. `data/projects.json` accepts bare GitHub repository links or objects with display overrides. `scripts/sync-github.ts` reads public repository metadata, README, all GitHub milestones and issues, twelve recent commits, twelve recent pull requests, and an optional roadmap file. It writes `src/data/github.json` atomically after the whole sync succeeds. Only public repositories are eligible, including when a local token has private access.

Progress uses milestone issue completion first, then roadmap checklist completion, then issue closure. No tracked work means no percentage. Every measure names its source; no whole-product completion is inferred. Pull requests are activity, not issues, and automated entries are labeled. Capsulet remains valuable through README and commit/PR activity even without milestones. Harmonix uses a maintained fallback because its README is title-only.

## Hosting and validation

Vite creates static assets. GitHub Actions syncs and deploys on main pushes, manual runs, and a daily schedule. No server or client token is needed. Node unit tests cover URL validation, configuration, roadmap extraction, progress semantics, and README links. TypeScript, production builds, desktop/mobile browser checks, and a live deployment check verify the result.
