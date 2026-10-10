import type { ProjectConfig, Project, Task } from "../src/types.ts";

export function repositoryFromUrl(input: string): string {
  const url = new URL(input);
  const match = /^\/([\w.-]+)\/([\w.-]+)\/?$/.exec(url.pathname);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !match
  ) {
    throw new Error(`Expected a GitHub repository URL, got: ${input}`);
  }
  return `${match[1]}/${match[2].replace(/\.git$/, "")}`;
}

export function parseConfig(value: unknown): ProjectConfig[] {
  if (!Array.isArray(value) || value.length === 0)
    throw new Error(
      "projects.json must be a nonempty array of repository URLs or objects.",
    );
  const configs = value
    .map((entry: unknown) => {
      const config: ProjectConfig =
        typeof entry === "string" ? { url: entry } : (entry as ProjectConfig);
      if (!config || typeof config.url !== "string")
        throw new Error("Every project must have a repository URL.");
      repositoryFromUrl(config.url);
      for (const key of [
        "name",
        "category",
        "summary",
        "roadmapPath",
        "fallbackAbout",
        "status",
      ] as const) {
        if (config[key] !== undefined && typeof config[key] !== "string")
          throw new Error(`${key} must be a string.`);
      }
      if (
        config.tags !== undefined &&
        (!Array.isArray(config.tags) ||
          !config.tags.every((tag) => typeof tag === "string"))
      )
        throw new Error("tags must be an array of strings.");
      if (config.enabled !== undefined && typeof config.enabled !== "boolean")
        throw new Error("enabled must be a boolean.");
      return config;
    })
    .filter((config) => config.enabled !== false);
  const names = configs.map((config) =>
    repositoryFromUrl(config.url).toLowerCase(),
  );
  if (new Set(names).size !== names.length)
    throw new Error("Duplicate project repositories in projects.json.");
  if (!configs.length) throw new Error("Enable at least one project.");
  return configs;
}

function plainTitle(input: string): string {
  return input
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

export function roadmapTasks(markdown: string, url: string): Task[] {
  // Ignore example code and status legends. Tables and Markdown task lists are supported.
  const clean = markdown.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1[^\n]*$/gm, "");
  const tasks: Task[] = [];
  for (const line of clean.split(/\r?\n/)) {
    const list = /^\s*[-*+]\s+\[([xX ~])\]\s+(.+)$/.exec(line);
    if (list) {
      tasks.push({
        title: plainTitle(list[2]),
        state: taskState(list[1]),
        url,
      });
      continue;
    }
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const statusIndex = cells.findIndex((cell) =>
      /^`?\[([xX ~])\]`?$/.test(cell),
    );
    if (statusIndex < 0 || cells.length < 3) continue;
    const title = cells.find(
      (cell, index) => index !== statusIndex && cell && !/^\d+$/.test(cell),
    );
    if (title)
      tasks.push({
        title: plainTitle(title),
        state: taskState(/\[([xX ~])\]/.exec(cells[statusIndex])![1]),
        url,
      });
  }
  return tasks.filter(
    (task, index) =>
      tasks.findIndex((other) => other.title === task.title) === index,
  );
}

function taskState(marker: string): Task["state"] {
  return /x/i.test(marker) ? "done" : marker === "~" ? "in-progress" : "todo";
}

export function calculateProgress(
  milestones: Project["milestones"],
  tasks: Task[],
  issues: Project["issues"],
): Project["progress"] {
  const milestoneTotal = milestones.reduce((n, m) => n + m.open + m.closed, 0);
  let source: Project["progress"]["source"] = "none";
  let closed = 0;
  let total = 0;
  if (milestoneTotal) {
    source = "milestones";
    total = milestoneTotal;
    closed = milestones.reduce((n, m) => n + m.closed, 0);
  } else if (tasks.length) {
    source = "roadmap";
    total = tasks.length;
    closed = tasks.filter((task) => task.state === "done").length;
  } else if (issues.open + issues.closed) {
    source = "issues";
    total = issues.open + issues.closed;
    closed = issues.closed;
  }
  return {
    source,
    closed,
    total,
    percent: total ? Math.round((closed / total) * 100) : null,
  };
}

export function githubAssetUrl(
  href: string,
  project: Pick<Project, "repo" | "branch" | "readmePath">,
  image = false,
): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//")) return href;
  if (href.startsWith("#"))
    return `https://github.com/${project.repo}#${href.slice(1)}`;
  const folder = project.readmePath?.split("/").slice(0, -1).join("/") || "";
  const prefix = image
    ? `https://raw.githubusercontent.com/${project.repo}/${encodeURIComponent(project.branch)}/`
    : `https://github.com/${project.repo}/blob/${encodeURIComponent(project.branch)}/`;
  return new URL(
    href.replace(/^\//, ""),
    prefix + (href.startsWith("/") || !folder ? "" : `${folder}/`),
  ).href;
}
