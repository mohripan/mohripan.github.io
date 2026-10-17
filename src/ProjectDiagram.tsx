import {
  Box,
  Braces,
  Database,
  FileText,
  GitBranch,
  Layers,
  Network,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Project } from "./types";

export default function ProjectDiagram({ project }: { project: Project }) {
  const type = project.repo.endsWith("flint-graph")
    ? "graph"
    : project.repo.endsWith("capsulet")
      ? "capsule"
      : project.repo.endsWith("workflow-automations")
        ? "flow"
        : project.repo.endsWith("capsulet-mesh-train")
          ? "training"
          : "unity";
  const icons =
    type === "graph"
      ? [FileText, Network, Sparkles]
      : type === "capsule"
        ? [GitBranch, ShieldCheck, Box]
        : type === "flow"
          ? [Braces, Database, Play]
          : type === "training"
            ? [Layers, Network, Play]
            : [Box, Layers, Sparkles];
  const labels =
    type === "graph"
      ? ["ingest", "connect", "retrieve"]
      : type === "capsule"
        ? ["define", "validate", "execute"]
        : type === "flow"
          ? ["trigger", "dispatch", "run"]
          : type === "training"
            ? ["gradients", "reduce", "update"]
            : ["scene", "script", "create"];
  return (
    <div
      className={`project-diagram diagram-${type}`}
      aria-label={`${project.name} architecture: ${labels.join(", ")}`}
    >
      <div className="diagram-lines" aria-hidden="true">
        <span />
        <span />
      </div>
      {icons.map((Icon, i) => (
        <div className="diagram-node" key={labels[i]}>
          <div className="node-icon">
            <Icon size={23} strokeWidth={1.5} />
          </div>
          <span>{labels[i]}</span>
        </div>
      ))}
      <span className="diagram-caption">
        {type === "graph"
          ? "source → knowledge → answers"
          : type === "capsule"
            ? "correctness at every step"
            : type === "flow"
              ? "events → distributed execution"
              : type === "training"
                ? "gradients → reduce → update"
                : "an earlier creative experiment"}
      </span>
    </div>
  );
}
