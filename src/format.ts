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
export function shortMilestone(title: string) {
  return title
    .replace(/^Milestone\s+\d+\s*:\s*/i, "")
    .replace(/^./, (c) => c.toUpperCase());
}
