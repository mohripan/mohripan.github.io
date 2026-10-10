import {
  ArrowUpRight,
  Check,
  Circle,
  CircleDashed,
  GitPullRequest,
  Milestone as MilestoneIcon,
} from "lucide-react";
import type { Project } from "./types";
import { dateLabel, progressLabel, shortMilestone } from "./format";

export default function Roadmap({
  project,
  limit,
  onActivity,
}: {
  project: Project;
  limit?: number;
  onActivity?: () => void;
}) {
  const milestones = [...project.milestones].sort((a, b) => {
    const number = (title: string) => Number(/\d+/.exec(title)?.[0] || 0);
    return number(a.title) - number(b.title);
  });
  const items = milestones.length ? milestones : project.tasks;
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <div className="roadmap-content">
      {project.progress.percent !== null && (
        <div className="roadmap-summary">
          <div>
            <span className="mono-label">
              {project.progress.source === "milestones"
                ? "GitHub milestones"
                : project.progress.source === "roadmap"
                  ? "Repository roadmap"
                  : "GitHub issues"}
            </span>
            <p>
              <strong>{project.progress.closed}</strong> /{" "}
              {project.progress.total} {progressLabel(project)}
            </p>
          </div>
          <span className="roadmap-percent">
            {project.progress.percent}
            <small>%</small>
          </span>
        </div>
      )}
      <div className="task-list">
        {shown.map((item, index) => {
          const isMilestone = "open" in item;
          const done = isMilestone
            ? item.state === "closed" || (item.closed > 0 && item.open === 0)
            : item.state === "done";
          const active = isMilestone
            ? item.closed > 0 && item.open > 0
            : item.state === "in-progress";
          const percent =
            isMilestone && item.open + item.closed
              ? Math.round((item.closed / (item.open + item.closed)) * 100)
              : null;
          return (
            <a
              key={`${item.title}-${index}`}
              className={`task-row ${done ? "task-done" : ""}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              <span
                className={`task-checkbox ${done ? "done" : active ? "in-progress" : ""}`}
              >
                {done ? (
                  <Check size={13} />
                ) : active ? (
                  <CircleDashed size={14} />
                ) : (
                  <Circle size={13} />
                )}
              </span>
              <span className="task-copy">
                <span>
                  {isMilestone ? shortMilestone(item.title) : item.title}
                </span>
                {isMilestone && (
                  <small>
                    {/^Milestone\s+\d+/i.exec(item.title)?.[0] || "Milestone"} ·{" "}
                    {item.closed}/{item.open + item.closed} issues closed
                    {item.due && ` · due ${dateLabel(item.due)}`}
                  </small>
                )}
              </span>
              {percent !== null && (
                <span className="task-mini-progress">
                  <span style={{ width: `${percent}%` }} />
                </span>
              )}
              <span
                className={`task-status ${done ? "complete" : active ? "active" : ""}`}
              >
                {done ? "Complete" : active ? "In progress" : "To do"}
              </span>
              <ArrowUpRight size={14} className="task-arrow" />
            </a>
          );
        })}
      </div>
      {!items.length && (
        <div className="roadmap-empty">
          <MilestoneIcon size={28} strokeWidth={1.3} />
          <h4>
            {project.progress.source === "issues"
              ? "Work tracked in issues"
              : "The work is in the code."}
          </h4>
          <p>
            {project.progress.source === "issues"
              ? "There are no milestones or roadmap tasks yet. Browse the repository issues to see tracked work."
              : "No milestones or roadmap checklist yet. Explore the README and recent commits or pull requests to see what has been built."}
          </p>
          {project.progress.source === "issues" ? (
            <a
              className="text-button"
              href={`${project.url}/issues`}
              target="_blank"
              rel="noreferrer"
            >
              Browse issues <ArrowUpRight size={14} />
            </a>
          ) : (
            onActivity && (
              <button className="text-button" onClick={onActivity}>
                <GitPullRequest size={15} /> Explore activity
              </button>
            )
          )}
        </div>
      )}
      {limit && items.length > limit && (
        <p className="source-note">
          Showing {limit} of {items.length} tracked milestones. Open the project
          for the full roadmap.
        </p>
      )}
      {project.progress.percent !== null && (
        <p className="source-note">
          Completion of tracked{" "}
          {project.progress.source === "milestones"
            ? "milestone issues"
            : project.progress.source === "roadmap"
              ? "roadmap tasks"
              : "issues"}
          ; this is not a whole-product completion estimate.
        </p>
      )}
    </div>
  );
}
