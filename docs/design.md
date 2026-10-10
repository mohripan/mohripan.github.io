# Ripan's engineering workspace

A public React/TypeScript portfolio hosted on GitHub Pages. The audience is engineers, collaborators, and people interested in Ripan's projects. The main job is to show what each project does and make its development visible.

## Experience

Dark workspace with rust-red accents, readable warm-white text, and restrained borders. Space Grotesk for headings, DM Sans for body text, and IBM Plex Mono for metadata. Palette: charcoal #17181b, panel #202125, border #34353b, warm white #ecebe7, muted gray #aaabb3, rust #e98b68. Signature: a project delivery trace inspired by graph and workflow execution, paired with real roadmap tasks. Responsive navigation, project category filters, search, overview/roadmap/activity project dialogs, progress summaries, and an about section.

## Data

`data/profile.json` is the editable personal profile. `data/projects.json` accepts bare GitHub repository links or objects with display overrides. `scripts/sync-github.ts` reads public repository metadata, README, all GitHub milestones and issues, twelve recent commits, twelve recent pull requests, and an optional roadmap file. It writes `src/data/github.json` atomically after the whole sync succeeds. Only public repositories are eligible, including when a local token has private access.

Progress uses milestone issue completion first, then roadmap checklist completion, then issue closure. No tracked work means no percentage. Every measure names its source; no whole-product completion is inferred. Pull requests are activity, not issues, and automated entries are labeled. Capsulet remains valuable through README and commit/PR activity even without milestones. Harmonix uses a maintained fallback because its README is title-only.

## Hosting and validation

Vite creates static assets. GitHub Actions syncs and deploys on main pushes, manual runs, and a daily schedule. No server or client token is needed. Node unit tests cover URL validation, configuration, roadmap extraction, progress semantics, and README links. TypeScript, production builds, desktop/mobile browser checks, and a live deployment check verify the result.
