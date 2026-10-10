import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  GitPullRequest,
  Milestone,
  X,
} from "lucide-react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project } from "./types";
import { githubAssetUrl } from "../scripts/github";
import { dateLabel } from "./format";
import ActivityFeed from "./ActivityFeed";
import Roadmap from "./Roadmap";

export default function ProjectDialog({
  project,
  initialTab,
  onClose,
}: {
  project: Project;
  initialTab: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState(initialTab);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  const meaningfulReadme =
    (project.readme || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/^#.*$/gm, "")
      .trim().length > 50;
  return (
    <dialog
      ref={dialog}
      className="project-dialog"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-header">
        <div>
          <span className="mono-label">
            {project.category} / {project.repo}
          </span>
          <h2 id="dialog-title">
            {project.name}
            <span className="status-pill">
              <span />
              {project.status}
            </span>
          </h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close project"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      <p className="dialog-intro">{project.summary}</p>
      <div className="dialog-links">
        <a href={project.url} target="_blank" rel="noreferrer">
          View repository <ArrowUpRight size={15} />
        </a>
        <span>Last push {dateLabel(project.pushedAt)}</span>
      </div>
      <div className="dialog-tabs" role="tablist" aria-label="Project details">
        {(
          [
            ["overview", "Overview", BookOpen],
            ["roadmap", "Roadmap", Milestone],
            ["activity", "Activity", GitPullRequest],
          ] as const
        ).map(([key, label, Icon], index, tabs) => {
          return (
            <button
              type="button"
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
              onKeyDown={(event) => {
                const direction =
                  event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0;
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : direction
                        ? (index + direction + tabs.length) % tabs.length
                        : null;
                if (next !== null) {
                  event.preventDefault();
                  setTab(tabs[next][0]);
                  document.getElementById(`tab-${tabs[next][0]}`)?.focus();
                }
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
      <div
        className="dialog-body"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "overview" && (
          <>
            <div className="readme-label">
              <BookOpen size={14} />
              <span>
                {meaningfulReadme
                  ? "From the project README"
                  : "Portfolio description"}
              </span>
              {project.readmePath && (
                <a
                  href={`${project.url}/blob/${encodeURIComponent(project.branch)}/${project.readmePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source <ArrowUpRight size={13} />
                </a>
              )}
            </div>
            <div className="markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                urlTransform={(url, key) => {
                  const safe = defaultUrlTransform(url);
                  return safe
                    ? githubAssetUrl(safe, project, key === "src")
                    : "";
                }}
                components={{
                  a: (props) => (
                    <a {...props} target="_blank" rel="noreferrer" />
                  ),
                  img: (props) => <img {...props} loading="lazy" />,
                }}
              >
                {meaningfulReadme
                  ? project.readme
                  : project.fallbackAbout ||
                    project.description ||
                    `${project.name} has no detailed README yet. Visit the repository or explore recent activity to learn more.`}
              </ReactMarkdown>
            </div>
          </>
        )}
        {tab === "roadmap" && (
          <Roadmap project={project} onActivity={() => setTab("activity")} />
        )}
        {tab === "activity" && <ActivityFeed projects={[project]} compact />}
      </div>
    </dialog>
  );
}
