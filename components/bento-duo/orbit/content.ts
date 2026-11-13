export interface OrbitProject {
  id: string;
  title: string;
  category: string;
  description: string;
  tasks: { id: string; label: string; done: boolean }[];
}
export interface OrbitFeature {
  id: string;
  title: string;
  description: string;
  caption: string;
}
export interface OrbitContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  projects: OrbitProject[];
  features: OrbitFeature[];
  activity: { id: string; title: string; time: string }[];
}
export const orbitContent: OrbitContent = {
  eyebrow: "ORBIT / STUDIO WORK INDEX",
  title: "Work, in\nprogress.",
  subtitle:
    "A collection of ongoing work. Select a project. Find the next step.",
  projects: [
    {
      id: "tidal",
      title: "Tidal identity",
      category: "Brand system",
      description:
        "A calmer identity for a different kind of coastal retreat. Built around the rhythm of the water.",
      tasks: [
        { id: "research", label: "Explore the territory", done: true },
        { id: "palette", label: "Find the right palette", done: true },
        { id: "type", label: "Refine the type system", done: false },
        { id: "handoff", label: "Prepare the handoff", done: false },
      ],
    },
    {
      id: "common",
      title: "Common ground",
      category: "Digital experience",
      description:
        "A gathering place for people who grow things. An open, useful home for a local growing collective.",
      tasks: [
        { id: "map", label: "Map the community", done: true },
        { id: "design", label: "Build the visual language", done: false },
        { id: "prototype", label: "Connect the prototype", done: false },
      ],
    },
    {
      id: "still",
      title: "Still objects",
      category: "Art direction",
      description:
        "Everyday objects, seen a little differently. A study of form, negative space and slow observation.",
      tasks: [
        { id: "study", label: "Collect the studies", done: true },
        { id: "sequence", label: "Sequence the collection", done: false },
      ],
    },
  ],
  features: [
    {
      id: "connect",
      title: "The brief.",
      description:
        "Project context is shared across the collection. Choose another project in the index.",
      caption: "BRIEF",
    },
    {
      id: "focus",
      title: "The next step.",
      description:
        "The next unfinished item, taken directly from this project’s checklist. Complete it in card 06.",
      caption: "NEXT",
    },
    {
      id: "adapt",
      title: "The project index.",
      description:
        "A count of completed steps for every project. Each checklist keeps its own state.",
      caption: "INDEX",
    },
  ],
  activity: [
    { id: "a", title: "Creative direction aligned", time: "09:12" },
    { id: "b", title: "First studies collected", time: "10:36" },
    { id: "c", title: "Your next move", time: "Now" },
  ],
};
export function projectProgress(
  project: OrbitProject,
  tasks: Record<string, boolean> = {},
) {
  const done = project.tasks.filter(
    (t) => tasks[`${project.id}:${t.id}`] ?? t.done,
  ).length;
  return Math.round((done / Math.max(1, project.tasks.length)) * 100);
}
