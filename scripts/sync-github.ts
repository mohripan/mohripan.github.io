import { execFileSync } from "node:child_process";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import {
  parseConfig,
  repositoryFromUrl,
  roadmapTasks,
  calculateProgress,
} from "./github.ts";
import type { Activity, Milestone, Project, Snapshot } from "../src/types.ts";

let token = process.env.GITHUB_TOKEN;
if (!token) {
  try {
    token = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    /* Public API works without authentication. */
  }
}
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ripan-portfolio-sync",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};
class GitHubError extends Error {
  constructor(
    public status: number,
    path: string,
  ) {
    super(`GitHub returned ${status} for ${path}`);
  }
}
async function api<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new GitHubError(response.status, path);
  return response.json() as Promise<T>;
}
async function optional<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}
async function pages<T>(path: string): Promise<T[]> {
  const result: T[] = [];
  for (let page = 1; page <= 100; page++) {
    const batch = await api<T[]>(
      `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
    );
    result.push(...batch);
    if (batch.length < 100) return result;
  }
  throw new Error(
    `Pagination safety limit reached for ${path}; snapshot not updated.`,
  );
}
type Repository = {
  private: boolean;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  archived: boolean;
  stargazers_count: number;
  pushed_at: string;
};
type FileContent = { content: string; path: string };
type GitHubMilestone = {
  title: string;
  description: string | null;
  state: string;
  html_url: string;
  open_issues: number;
  closed_issues: number;
  due_on: string | null;
};
type Issue = { state: string; pull_request?: unknown };
type Commit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } };
  author: { login: string; type: string } | null;
};
type Pull = {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  merged_at: string | null;
  state: string;
  user: { login: string; type: string };
};
const decode = (file: FileContent | null) =>
  file ? Buffer.from(file.content, "base64").toString("utf8") : null;

async function main() {
  const configs = parseConfig(
    JSON.parse(
      await readFile(new URL("../data/projects.json", import.meta.url), "utf8"),
    ),
  );
  const projects: Project[] = [];
  for (const config of configs) {
    const repo = repositoryFromUrl(config.url);
    const metadata = await api<Repository>(`repos/${repo}`);
    // Never publish private repository data, even when the local gh session can read it.
    if (metadata.private)
      throw new Error(
        `${repo} is private. Only public repositories can be featured.`,
      );
    const root = `repos/${metadata.full_name}`;
    const [readme, milestones, issues, commits, pulls, roadmap] =
      await Promise.all([
        optional<FileContent>(`${root}/readme`),
        pages<GitHubMilestone>(`${root}/milestones?state=all`),
        pages<Issue>(`${root}/issues?state=all`),
        api<Commit[]>(`${root}/commits?per_page=12`),
        api<Pull[]>(
          `${root}/pulls?state=all&sort=updated&direction=desc&per_page=12`,
        ),
        config.roadmapPath
          ? optional<FileContent>(
              `${root}/contents/${config.roadmapPath.split("/").map(encodeURIComponent).join("/")}`,
            )
          : Promise.resolve(null),
      ]);
    const cleanIssues = issues.filter((issue) => !issue.pull_request);
    const issueCounts = {
      open: cleanIssues.filter((issue) => issue.state === "open").length,
      closed: cleanIssues.filter((issue) => issue.state === "closed").length,
    };
    const mappedMilestones: Milestone[] = milestones.map((m) => ({
      title: m.title,
      description: m.description,
      state: m.state,
      url: m.html_url,
      open: m.open_issues,
      closed: m.closed_issues,
      due: m.due_on,
    }));
    const roadmapUrl = roadmap
      ? `${metadata.html_url}/blob/${encodeURIComponent(metadata.default_branch)}/${config.roadmapPath}`
      : null;
    const tasks = roadmap ? roadmapTasks(decode(roadmap)!, roadmapUrl!) : [];
    const activity: Activity[] = [
      ...commits.map((c) => ({
        id: c.sha,
        kind: "commit" as const,
        title: c.commit.message.split("\n")[0],
        url: c.html_url,
        date: c.commit.author.date,
        author: c.author?.login || c.commit.author.name,
        bot: c.author?.type === "Bot" || /\[bot\]/.test(c.author?.login || ""),
      })),
      ...pulls.map((p) => ({
        id: `pr-${p.number}`,
        kind: "pull-request" as const,
        title: p.title,
        url: p.html_url,
        date: p.merged_at || p.updated_at,
        author: p.user.login,
        bot: p.user.type === "Bot" || /\[bot\]/.test(p.user.login),
        state: p.merged_at
          ? ("merged" as const)
          : p.state === "open"
            ? ("open" as const)
            : ("closed" as const),
      })),
    ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const name = config.name || metadata.name;
    projects.push({
      id: metadata.full_name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      name,
      repo: metadata.full_name,
      url: metadata.html_url,
      category: config.category || "Projects",
      summary:
        config.summary ||
        metadata.description ||
        `Explore ${name}'s README, progress, and recent development.`,
      tags: config.tags || (metadata.language ? [metadata.language] : []),
      language: metadata.language,
      status: config.status || (metadata.archived ? "Archived" : "Open source"),
      branch: metadata.default_branch,
      stars: metadata.stargazers_count,
      pushedAt: metadata.pushed_at,
      readme: decode(readme),
      readmePath: readme?.path || null,
      fallbackAbout: config.fallbackAbout || null,
      description: metadata.description,
      milestones: mappedMilestones,
      tasks,
      roadmapUrl,
      issues: issueCounts,
      progress: calculateProgress(mappedMilestones, tasks, issueCounts),
      activity,
    });
    console.log(
      `Synced ${repo}: ${mappedMilestones.length} milestones, ${tasks.length} roadmap tasks, ${activity.length} recent activity entries`,
    );
  }
  const snapshot: Snapshot = { syncedAt: new Date().toISOString(), projects };
  const folder = new URL("../src/data/", import.meta.url);
  await mkdir(folder, { recursive: true });
  const temporary = new URL("github.json.tmp", folder);
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + "\n");
  await rename(temporary, new URL("github.json", folder));
  console.log(
    "GitHub snapshot saved. No credentials are included in the output.",
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "GitHub sync failed.");
  process.exitCode = 1;
});
