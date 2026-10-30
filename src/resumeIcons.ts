import {
  AudioLines,
  Boxes,
  Cloud,
  CodeXml,
  Cpu,
  Gauge,
  Plug,
  Search,
  Workflow,
} from "lucide-react";

// Keys used by the "icon" fields in data/resume.json.
const resumeIcons = {
  audio: AudioLines,
  compute: Cpu,
  systems: Boxes,
  workflow: Workflow,
  search: Search,
  observe: Gauge,
  code: CodeXml,
  cloud: Cloud,
  integration: Plug,
};

export const resumeIcon = (key: string) =>
  resumeIcons[key as keyof typeof resumeIcons] ?? Boxes;
