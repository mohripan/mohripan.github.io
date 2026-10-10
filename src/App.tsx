import { lazy, Suspense, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CircleDashed,
  ChevronDown,
  GitPullRequest,
  Mail,
  Milestone,
  Search,
  Terminal,
  X,
} from "lucide-react";
import Github from "./GithubIcon";
import profile from "../data/profile.json";
import rawSnapshot from "./data/github.json";
import type { Project, Snapshot } from "./types";
import {
  dateLabel,
  progressLabel,
  relativeDate,
  shortMilestone,
} from "./format";
import ProjectDiagram from "./ProjectDiagram";
import ActivityFeed from "./ActivityFeed";
import Roadmap from "./Roadmap";

const ProjectDialog = lazy(() => import("./ProjectDialog"));
const snapshot = rawSnapshot as Snapshot;
const projects = snapshot.projects;
const categories = [
  "All projects",
  ...new Set(projects.map((project) => project.category)),
];

export default function App() {
  const [category, setCategory] = useState("All projects");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{
    project: Project;
    tab: string;
  } | null>(null);
  const [roadmapId, setRoadmapId] = useState(projects[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = projects.filter(
    (project) =>
      (category === "All projects" || project.category === category) &&
      `${project.name} ${project.repo} ${project.summary} ${project.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const roadmapProject = projects.find((project) => project.id === roadmapId)!;
  const totalMilestones = projects.reduce(
    (sum, project) => sum + project.milestones.length,
    0,
  );
  const recentPRs = projects.reduce(
    (sum, project) =>
      sum +
      project.activity.filter((activity) => activity.kind === "pull-request")
        .length,
    0,
  );
  const featured =
    projects.find((project) => project.milestones.length) || projects[0];
  const activeMilestones = featured.milestones
    .filter((milestone) => milestone.state === "open" && milestone.open > 0)
    .slice(0, 3);
  const openProject = (project: Project, tab = "overview") =>
    setSelected({ project, tab });

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand" aria-label="Ripan workspace home">
            <span className="brand-icon">
              <Terminal size={19} strokeWidth={2} />
            </span>
            <span>
              ripan<span className="brand-dot">.</span>
              <span className="brand-workspace">workspace</span>
            </span>
          </a>
          <button
            className="menu-toggle icon-button"
            aria-expanded={menuOpen}
            aria-controls="navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={20} />
            ) : (
              <span className="menu-lines">
                <i />
                <i />
              </span>
            )}
          </button>
          <nav
            id="navigation"
            className={menuOpen ? "is-open" : ""}
            aria-label="Main navigation"
          >
            <a href="#projects" onClick={() => setMenuOpen(false)}>
              Projects
            </a>
            <a href="#roadmap" onClick={() => setMenuOpen(false)}>
              Roadmap
            </a>
            <a href="#activity" onClick={() => setMenuOpen(false)}>
              Activity
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About me
            </a>
            <a
              className="nav-github"
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} />
              GitHub
              <ArrowUpRight size={13} />
            </a>
          </nav>
        </div>
      </header>

      <main id="main" className="page-shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />A living portfolio{" "}
              <span className="eyebrow-divider">/</span> @{profile.username}
            </div>
            <h1 id="hero-title">
              {profile.headline.split(" ")[0]}
              <br />
              <span>{profile.headline.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p>{profile.intro}</p>
            <div className="hero-actions">
              <a href="#projects" className="primary-button">
                Explore the projects <ArrowDown size={16} />
              </a>
              <a href="#about" className="text-button">
                Meet the engineer <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="hero-person">
              <img
                src={`https://github.com/${profile.username}.png?size=80`}
                alt=""
                width="34"
                height="34"
              />
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.role}</span>
              </div>
            </div>
          </div>
          <div className="workbench">
            <div className="workbench-top">
              <span>
                <Terminal size={14} />
                On the workbench
              </span>
              <span className="window-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="workbench-project">
              <div>
                <span className="mono-label">Featured build</span>
                <h2>{featured.name}</h2>
              </div>
              <span className="workbench-tag">{featured.language}</span>
            </div>
            <ProjectDiagram project={featured} />
            <div className="workbench-tasks">
              <div className="workbench-task-heading">
                {activeMilestones.length
                  ? "Open milestones"
                  : "Latest development"}
                <span>
                  {activeMilestones.length
                    ? `${featured.milestones.length} tracked`
                    : "Build notes"}
                </span>
              </div>
              {activeMilestones.length
                ? activeMilestones.map((m) => (
                    <button
                      key={m.title}
                      onClick={() => openProject(featured, "roadmap")}
                    >
                      <span
                        className={`mini-checkbox ${m.closed ? "started" : ""}`}
                      >
                        {m.closed ? <CircleDashed size={11} /> : null}
                      </span>
                      <span>{shortMilestone(m.title)}</span>
                      <small>
                        {m.closed}/{m.open + m.closed}
                      </small>
                    </button>
                  ))
                : featured.activity.slice(0, 3).map((a) => (
                    <a href={a.url} key={a.id} target="_blank" rel="noreferrer">
                      {a.title}
                    </a>
                  ))}
            </div>
            <div className="workbench-bottom">
              <span className="status-dot" />
              Synced with GitHub <span>{dateLabel(snapshot.syncedAt)}</span>
            </div>
          </div>
        </section>

        <div className="workspace-stats">
          <div>
            <strong>{projects.length.toString().padStart(2, "0")}</strong>
            <span>Featured projects</span>
          </div>
          <div>
            <strong>{totalMilestones.toString().padStart(2, "0")}</strong>
            <span>Tracked milestones</span>
          </div>
          <div>
            <strong>{recentPRs.toString().padStart(2, "0")}</strong>
            <span>Recent pull requests</span>
          </div>
          <p>
            <span className="status-dot" />
            Building in the open<span>One commit at a time.</span>
          </p>
        </div>

        <section id="projects" className="projects-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow section-eyebrow">The work</span>
              <h2>
                Projects, with a paper trail<span>.</span>
              </h2>
              <p>What I'm building, where it stands, and what comes next.</p>
            </div>
            <a
              className="text-button muted-link"
              href={`${profile.links.github}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
            >
              All repositories <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="project-toolbar">
            <div className="category-filters" aria-label="Project categories">
              {categories.map((item) => (
                <button
                  key={item}
                  aria-pressed={category === item}
                  className={category === item ? "selected" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                  {item === "All projects" && <span>{projects.length}</span>}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={16} />
              <input
                aria-label="Search projects"
                placeholder="Find a project…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  className="clear-search"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X size={14} />
                </button>
              )}
              <span className="search-key" aria-hidden="true">
                /
              </span>
            </label>
          </div>
          <div className="project-grid">
            {filtered.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <span className="mono-label">{project.category}</span>
                  <span
                    className={`project-status ${/archiv/i.test(project.status) ? "archived" : ""}`}
                  >
                    <span />
                    {project.status}
                  </span>
                </div>
                <ProjectDiagram project={project} />
                <div className="project-card-body">
                  <div className="project-name">
                    <h3>
                      <button onClick={() => openProject(project)}>
                        {project.name}
                      </button>
                    </h3>
                    <a
                      className="repo-link"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} on GitHub`}
                    >
                      <Github size={18} />
                    </a>
                  </div>
                  <p>{project.summary}</p>
                  <div className="tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="card-progress">
                    {project.progress.percent !== null ? (
                      <>
                        <div>
                          <span>
                            {project.progress.source === "milestones"
                              ? "Milestone progress"
                              : project.progress.source === "roadmap"
                                ? "Roadmap progress"
                                : "Issue closure"}
                          </span>
                          <strong>{project.progress.percent}%</strong>
                        </div>
                        <div
                          className="progress-track"
                          role="progressbar"
                          aria-label={`${project.name} ${progressLabel(project)}`}
                          aria-valuenow={project.progress.percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <span
                            style={{ width: `${project.progress.percent}%` }}
                          />
                        </div>
                        <small>
                          {project.progress.closed}/{project.progress.total}{" "}
                          {progressLabel(project)}
                        </small>
                      </>
                    ) : (
                      <>
                        <div>
                          <span>
                            {/archiv/i.test(project.status)
                              ? "From the archive"
                              : "Development log"}
                          </span>
                          <GitPullRequest size={14} />
                        </div>
                        <p>
                          {project.activity.some(
                            (a) => a.kind === "pull-request",
                          )
                            ? "Follow commits & pull requests"
                            : "Explore the code & build history"}
                        </p>
                        <small>
                          No tracked milestone or roadmap percentage
                        </small>
                      </>
                    )}
                  </div>
                </div>
                <div className="project-card-footer">
                  <span>Last push {relativeDate(project.pushedAt)}</span>
                  <button onClick={() => openProject(project)}>
                    Explore project <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className="no-projects">
              <Search size={24} />
              <h3>No matching projects</h3>
              <p>Try another name, technology, or category.</p>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setCategory("All projects");
                }}
              >
                Reset filters <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>

        <section id="roadmap" className="roadmap-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow section-eyebrow">The next steps</span>
              <h2>
                A roadmap you can follow<span>.</span>
              </h2>
              <p>
                The to-do list behind the portfolio. Sourced from the
                repositories.
              </p>
            </div>
            <div className="select-wrapper">
              <Milestone size={16} />
              <select
                aria-label="Choose project roadmap"
                value={roadmapId}
                onChange={(event) => setRoadmapId(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="roadmap-panel">
            <Roadmap
              project={roadmapProject}
              limit={6}
              onActivity={() => openProject(roadmapProject, "activity")}
            />
            <div className="roadmap-panel-footer">
              <span>
                <span className="status-dot" />
                {roadmapProject.name} /{" "}
                {roadmapProject.progress.source === "roadmap"
                  ? "Repository roadmap file"
                  : "GitHub tracking"}
              </span>
              <button
                className="text-button"
                onClick={() => openProject(roadmapProject, "roadmap")}
              >
                Explore full roadmap <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <section id="activity" className="activity-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow section-eyebrow">The build log</span>
              <h2>
                Small changes. Forward motion<span>.</span>
              </h2>
              <p>
                Commits, pull requests, and the maintenance that keeps things
                moving.
              </p>
            </div>
            <span className="sync-badge">
              <span className="status-dot" />
              Updated {dateLabel(snapshot.syncedAt)}
            </span>
          </div>
          <ActivityFeed projects={projects} />
        </section>

        <section id="about" className="about-section">
          <div className="about-left">
            <span className="eyebrow section-eyebrow">Behind the commits</span>
            <h2>
              Hi, I'm Ripan<span>.</span>
            </h2>
            <p className="about-thesis">
              I like the parts of engineering
              <br />
              that make everything else work.
            </p>
            <div className="about-location">
              <span className="status-dot" />
              {profile.location}
            </div>
          </div>
          <div className="about-right">
            <div className="about-role">
              <img
                src={`https://github.com/${profile.username}.png?size=120`}
                alt={profile.name}
                width="48"
                height="48"
              />
              <div>
                <strong>{profile.role}</strong>
                <span>{profile.company}</span>
              </div>
            </div>
            <p>{profile.about}</p>
            <div className="about-interests">
              {profile.interests.map((interest) => (
                <span key={interest}>
                  <ArrowRight size={13} />
                  {interest}
                </span>
              ))}
            </div>
            <div className="about-skills">
              {profile.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            <div className="about-links">
              <a href={profile.links.github} target="_blank" rel="noreferrer">
                <Github size={16} />
                GitHub <ArrowUpRight size={14} />
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <ArrowUpRight size={14} />
              </a>
              <a href={profile.links.email}>
                <Mail size={16} />
                Say hello <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div>
          <a href="#" className="brand">
            ripan<span className="brand-dot">.</span>
          </a>
          <p>Always a work in progress.</p>
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <a
            href={`https://github.com/${profile.username}/mohripan.github.io`}
            target="_blank"
            rel="noreferrer"
          >
            View this site's source <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
      {selected && (
        <Suspense
          fallback={
            <div className="dialog-loading" role="status">
              Opening project…
            </div>
          }
        >
          <ProjectDialog
            key={selected.project.id}
            project={selected.project}
            initialTab={selected.tab}
            onClose={() => setSelected(null)}
          />
        </Suspense>
      )}
    </>
  );
}
