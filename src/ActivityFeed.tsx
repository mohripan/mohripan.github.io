import { useState } from "react";
import {
  ArrowUpRight,
  Bot,
  GitCommitHorizontal,
  GitPullRequest,
} from "lucide-react";
import type { Project } from "./types";
import { dateLabel, relativeDate } from "./format";

export default function ActivityFeed({
  projects,
  compact = false,
}: {
  projects: Project[];
  compact?: boolean;
}) {
  const [kind, setKind] = useState("all");
  const [hideBots, setHideBots] = useState(false);
  const [limit, setLimit] = useState(compact ? 8 : 6);
  const updates = projects
    .flatMap((project) =>
      project.activity.map((activity) => ({
        ...activity,
        project: project.name,
      })),
    )
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .filter(
      (activity) =>
        (kind === "all" || activity.kind === kind) &&
        (!hideBots || !activity.bot),
    );
  function changeKind(value: string) {
    setKind(value);
    setLimit(compact ? 8 : 6);
  }
  return (
    <div className="activity-feed">
      <div className="activity-controls">
        <div className="segmented" aria-label="Activity type">
          {[
            ["all", "All updates"],
            ["commit", "Commits"],
            ["pull-request", "Pull requests"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={kind === value ? "selected" : ""}
              aria-pressed={kind === value}
              onClick={() => changeKind(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="bot-filter">
          <input
            type="checkbox"
            checked={hideBots}
            onChange={(event) => setHideBots(event.target.checked)}
          />
          Hide automated
        </label>
      </div>
      <div className="activity-list">
        {updates.slice(0, limit).map((update) => (
          <a
            className="activity-row"
            key={`${update.project}-${update.id}`}
            href={update.url}
            target="_blank"
            rel="noreferrer"
          >
            <span
              className={`activity-icon ${update.state === "merged" ? "merged" : ""}`}
            >
              {update.kind === "commit" ? (
                <GitCommitHorizontal size={19} />
              ) : (
                <GitPullRequest size={19} />
              )}
            </span>
            <span className="activity-content">
              <span className="activity-title">{update.title}</span>
              <span className="activity-meta">
                <span>{update.project}</span>
                <span>·</span>
                <span>{update.author}</span>
                {update.bot && (
                  <span className="bot-badge">
                    <Bot size={11} />
                    automated
                  </span>
                )}
                {update.state && (
                  <span className={`pr-state ${update.state}`}>
                    {update.state}
                  </span>
                )}
              </span>
            </span>
            <time dateTime={update.date} title={dateLabel(update.date)}>
              {relativeDate(update.date)}
            </time>
            <ArrowUpRight size={15} className="activity-arrow" />
          </a>
        ))}
      </div>
      {!updates.length && (
        <p className="empty-message">
          No updates match these filters. Try all updates or include automated
          activity.
        </p>
      )}
      {updates.length > limit && (
        <button
          className="text-button load-more"
          onClick={() => setLimit((current) => current + 10)}
        >
          Show more updates <span>({updates.length - limit})</span>
        </button>
      )}
      <p className="source-note">
        Latest 12 commits and 12 pull requests per project. PR dates reflect
        their latest update or merge.
      </p>
    </div>
  );
}
