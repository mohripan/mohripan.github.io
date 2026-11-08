import type { Project } from "./types";

export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
export function relativeDate(date: string) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(date)) / 86_400_000),
  );
  if (!days) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
export function progressLabel(project: Project) {
  return {
    milestones: "milestone issues closed",
    roadmap: "roadmap tasks complete",
    issues: "issues closed",
    none: "No tracked tasks yet",
  }[project.progress.source];
}
export function sortedMilestones(project: Project) {
  const number = (title: string) => Number(/\d+/.exec(title)?.[0] || 0);
  return [...project.milestones].sort(
    (a, b) => number(a.title) - number(b.title),
  );
}
// A short preview shows where the work is now: the newest started item, a little
// of what came before it, and what comes next. Long-running projects otherwise
// open on their oldest history.
export function focusWindow<T>(
  items: T[],
  limit: number,
  started: (item: T) => boolean,
) {
  if (items.length <= limit) return items;
  let latest = -1;
  items.forEach((item, index) => {
    if (started(item)) latest = index;
  });
  const start = Math.max(
    0,
    Math.min(latest - Math.floor(limit / 3), items.length - limit),
  );
  return items.slice(start, start + limit);
}
export function shortMilestone(title: string) {
  return title
    .replace(/^Milestone\s+\d+\s*:\s*/i, "")
    .replace(/^./, (c) => c.toUpperCase());
}
