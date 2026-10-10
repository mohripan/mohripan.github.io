import { test } from "node:test";
import assert from "node:assert/strict";
import {
  repositoryFromUrl,
  parseConfig,
  roadmapTasks,
  calculateProgress,
  githubAssetUrl,
} from "./github.ts";

test("accepts repository links and rejects external or non-repository URLs", () => {
  assert.equal(
    repositoryFromUrl("https://github.com/mohripan/capsulet.git"),
    "mohripan/capsulet",
  );
  for (const url of [
    "https://example.com/me/repo",
    "https://github.com/me/repo/issues",
    "http://github.com/me/repo",
    "https://github.com/me/repo?private=true",
  ])
    assert.throws(() => repositoryFromUrl(url));
});
test("a bare link is enough, disabled projects are omitted, duplicate repos are rejected", () => {
  assert.deepEqual(
    parseConfig([
      "https://github.com/me/repo",
      { url: "https://github.com/me/other", enabled: false },
    ]),
    [{ url: "https://github.com/me/repo" }],
  );
  assert.throws(() =>
    parseConfig(["https://github.com/me/repo", "https://github.com/ME/REPO"]),
  );
  assert.throws(() =>
    parseConfig([{ url: "https://github.com/me/repo", tags: "Rust" }]),
  );
});
test("roadmaps support task lists and status tables without counting examples or legends", () => {
  const markdown =
    "| Symbol | Meaning |\n| `[x]` | Done |\n\n| 1 | [Auth](#auth) | Security | `[x]` |\n| 2 | API | Backend | `[~]` |\n- [ ] Release\n```md\n- [x] Example\n```";
  assert.deepEqual(roadmapTasks(markdown, "https://github.com"), [
    { title: "Auth", state: "done", url: "https://github.com" },
    { title: "API", state: "in-progress", url: "https://github.com" },
    { title: "Release", state: "todo", url: "https://github.com" },
  ]);
});
test("progress describes actual tracked work, and stays unknown without tracked items", () => {
  assert.deepEqual(calculateProgress([], [], { open: 0, closed: 0 }), {
    source: "none",
    closed: 0,
    total: 0,
    percent: null,
  });
  assert.equal(
    calculateProgress([], [{ title: "Auth", state: "done", url: "" }], {
      open: 4,
      closed: 0,
    }).source,
    "roadmap",
  );
  const milestones = [
    {
      title: "MVP",
      description: null,
      state: "open",
      url: "",
      open: 3,
      closed: 1,
      due: null,
    },
  ];
  assert.equal(
    calculateProgress(milestones, [], { open: 1, closed: 9 }).percent,
    25,
  );
});
test("README relative image and documentation links resolve to their source repository", () => {
  const repo = {
    repo: "me/repo",
    branch: "main",
    readmePath: "docs/README.md",
  };
  assert.equal(
    githubAssetUrl("images/demo.png", repo, true),
    "https://raw.githubusercontent.com/me/repo/main/docs/images/demo.png",
  );
  assert.equal(
    githubAssetUrl("../guide.md", repo),
    "https://github.com/me/repo/blob/main/guide.md",
  );
  assert.equal(
    githubAssetUrl("#setup", repo),
    "https://github.com/me/repo#setup",
  );
});
