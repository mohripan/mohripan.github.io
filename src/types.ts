export type ProjectConfig = {
  url: string;
  name?: string;
  category?: string;
  summary?: string;
  tags?: string[];
  roadmapPath?: string;
  fallbackAbout?: string;
  status?: string;
  enabled?: boolean;
};

export type Task = {
  title: string;
  state: "done" | "in-progress" | "todo";
  url: string;
};
export type Milestone = {
  title: string;
  description: string | null;
  state: string;
  url: string;
  open: number;
  closed: number;
  due: string | null;
};
export type Activity = {
  id: string;
  kind: "commit" | "pull-request";
  title: string;
  url: string;
  date: string;
  author: string;
  bot: boolean;
  state?: "open" | "merged" | "closed";
};
export type Project = {
  id: string;
  name: string;
  repo: string;
  url: string;
  category: string;
  summary: string;
  tags: string[];
  language: string | null;
  status: string;
  branch: string;
  stars: number;
  pushedAt: string;
  readme: string | null;
  readmePath: string | null;
  fallbackAbout: string | null;
  description: string | null;
  milestones: Milestone[];
  tasks: Task[];
  roadmapUrl: string | null;
  issues: { open: number; closed: number };
  progress: {
    source: "milestones" | "roadmap" | "issues" | "none";
    closed: number;
    total: number;
    percent: number | null;
  };
  activity: Activity[];
};
export type Snapshot = { syncedAt: string; projects: Project[] };
