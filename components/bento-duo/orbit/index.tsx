"use client";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { orbitContent, projectProgress, type OrbitContent } from "./content";
import s from "./orbit.module.css";
export * from "./content";
export type OrbitCardId =
  | "overview"
  | "command"
  | "tokens"
  | "activity"
  | "progress"
  | "details";
export interface OrbitBentoProps {
  content?: OrbitContent;
  initialProjectId?: string;
  accent?: "iris" | "lagoon";
  initialRadius?: number;
  spans?: Partial<
    Record<OrbitCardId, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >;
  onProjectChange?: (id: string) => void;
  className?: string;
  /** Host tokens. Design DNA uses these to apply a validated palette without leaking CSS. */
  style?: CSSProperties;
}
export function OrbitCard({
  children,
  className = "",
  span,
  label,
}: {
  children: ReactNode;
  className?: string;
  span?: number;
  label: string;
}) {
  return (
    <section
      aria-label={label}
      className={`${s.card} ${className}`}
      style={span ? ({ "--span": span } as CSSProperties) : undefined}
    >
      {children}
    </section>
  );
}
// Public primitive retained: a typographic specimen replaces the decorative orbit.
export function OrbitArt({ mode = 0 }: { mode?: number }) {
  const index = (((Math.trunc(mode) || 0) % 3) + 3) % 3;
  return (
    <div className={s.specimen} aria-hidden="true">
      <span>{["Aa", "Rr", "012"][index]}</span>
      <small>TYPE STUDY / {String(index + 1).padStart(2, "0")}</small>
    </div>
  );
}
export function OrbitBento({
  content = orbitContent,
  initialProjectId,
  accent = "iris",
  initialRadius = 12,
  spans,
  onProjectChange,
  className = "",
  style,
}: OrbitBentoProps) {
  const [selected, setSelected] = useState(
    initialProjectId ?? content.projects[0]?.id,
  );
  const [theme, setTheme] = useState(accent);
  const [radius, setRadius] = useState(() => Math.min(32, Math.max(8, Math.round(initialRadius))));
  const [feature, setFeature] = useState(0);
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();
  const project =
    content.projects.find((p) => p.id === selected) ?? content.projects[0];
  if (!project || !content.features.length)
    return <div className={s.root}>Add a project and a feature to begin.</div>;
  const current = content.features[feature % content.features.length];
  const progress = projectProgress(project, tasks);
  const isDone = (id: string, done: boolean) =>
    tasks[`${project.id}:${id}`] ?? done;
  const open = project.tasks.filter((t) => !isDone(t.id, t.done));
  const number = String(content.projects.indexOf(project) + 1).padStart(2, "0");
  const matches = content.projects.filter((p) =>
    `${p.title} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  function select(id: string) {
    setSelected(id);
    setNote(
      `${content.projects.find((p) => p.id === id)?.title ?? "Project"} selected. Brief and checklist updated.`,
    );
    onProjectChange?.(id);
  }
  function completeNext() {
    if (open[0]) {
      setTasks((previous) => ({
        ...previous,
        [`${project.id}:${open[0].id}`]: true,
      }));
      setNote(`${open[0].label} completed.`);
    } else setNote("All steps complete.");
  }
  return (
    <div
      ref={root}
      className={`${s.root} ${className}`}
      data-accent={theme}
      onKeyDown={(e) => {
        const target = e.target as HTMLElement;
        if (
          e.key === "/" &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey &&
          !target.closest("input, textarea, select, [contenteditable=true]")
        ) {
          e.preventDefault();
          search.current?.focus();
        }
      }}
      style={{ ...style, "--radius": `${radius}px` } as CSSProperties}
    >
      <div className={s.grid}>
        <OrbitCard
          label="Feature showcase"
          span={spans?.overview}
          className={s.overview}
        >
          <div className={s.cardTop}>
            <span className={s.kicker}>{content.eyebrow}</span>
            <span className={s.edition}>OB / 02</span>
          </div>
          <div className={s.heroCopy}>
            <h2>
              {content.title.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <p>{content.subtitle}</p>
          </div>
          <div className={s.featureFoot}>
            <span className={s.kicker}>READ THE PROJECT</span>
            <div className={s.dots} aria-label="Choose a feature">
              {content.features.map((f, i) => (
                <button
                  key={f.id}
                  aria-label={`${String(i + 1).padStart(2, "0")} ${f.caption}: ${f.title}`}
                  aria-pressed={i === feature}
                  onClick={() => setFeature(i)}
                >
                  {String(i + 1).padStart(2, "0")} <span>{f.caption}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={s.projectSheet} data-orbit-view={feature % 3}>
            <div className={s.sheetHeader}>
              <span>{current.title}</span>
              <span>{project.category}</span>
            </div>
            {feature % 3 === 0 ? (
              <div className={s.brief}>
                <span className={s.projectNumber}>{number}</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </div>
            ) : feature % 3 === 1 ? (
              <div className={s.nextSheet}>
                <span className={s.projectNumber}>
                  {String(open.length).padStart(2, "0")}
                </span>
                <div>
                  <small>STEPS REMAINING / {project.title}</small>
                  <h3>{open[0]?.label ?? "Ready for handoff."}</h3>
                  <p>
                    {open.length
                      ? `Then: ${open[1]?.label ?? "the project is complete."}`
                      : "Every item in this checklist is complete."}
                  </p>
                </div>
              </div>
            ) : (
              <ol className={s.projectIndex}>
                {content.projects.map((p, i) => (
                  <li key={p.id} data-selected={p.id === project.id}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{p.title}</strong>
                    <span>{projectProgress(p, tasks)}%</span>
                  </li>
                ))}
              </ol>
            )}
            <p className={s.featureDescription}>{current.description}</p>
          </div>
          <div className={s.coverFoot}>
            <span>SELECTED / {number}</span>
            <span>
              {project.tasks.length - open.length} OF {project.tasks.length}{" "}
              STEPS COMPLETE
            </span>
          </div>
        </OrbitCard>
        <OrbitCard
          label="Project command search"
          span={spans?.command}
          className={s.command}
        >
          <div className={s.cardTop}>
            <span className={s.kicker}>02 / PROJECT INDEX</span>
            <span className={s.count}>
              {String(content.projects.length).padStart(2, "0")}
            </span>
          </div>
          <h3>Choose your context.</h3>
          <label className={s.search}>
            <input
              ref={search}
              aria-label="Search projects"
              placeholder="Find a project…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  root.current
                    ?.querySelector<HTMLButtonElement>("[data-orbit-result]")
                    ?.focus();
                }
                if (e.key === "Enter" && matches[0]) select(matches[0].id);
              }}
            />
            <kbd>/</kbd>
          </label>
          <div className={s.results} aria-label="Project results">
            {matches.map((p, i) => (
              <button
                data-orbit-result
                key={p.id}
                aria-pressed={p.id === project.id}
                onClick={() => select(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const buttons = Array.from(
                      root.current?.querySelectorAll<HTMLButtonElement>(
                        "[data-orbit-result]",
                      ) ?? [],
                    );
                    buttons[
                      (i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
                        buttons.length
                    ]?.focus();
                  }
                  if (e.key === "Escape") search.current?.focus();
                }}
              >
                <span className={s.projectMark}>
                  {String(content.projects.indexOf(p) + 1).padStart(2, "0")}
                </span>
                <span>
                  {p.title}
                  <small>{p.category}</small>
                </span>
                <span aria-hidden="true">
                  {p.id === project.id ? "●" : "+"}
                </span>
              </button>
            ))}
            {!matches.length && (
              <p role="status">No projects found. Try another name.</p>
            )}
          </div>
        </OrbitCard>
        <OrbitCard
          label="Theme and token controls"
          span={spans?.tokens}
          className={s.tokens}
        >
          <div className={s.cardTop}>
            <span className={s.kicker}>03 / TYPE & TONE</span>
            <span className={s.kicker}>Aa</span>
          </div>
          <div className={s.tokenPreview}>
            <OrbitArt mode={theme === "iris" ? 0 : 1} />
            <p>
              One accent.
              <br />
              Across the collection.
            </p>
          </div>
          <div className={s.swatches}>
            {(["iris", "lagoon"] as const).map((value) => (
              <button
                key={value}
                aria-label={`${value === "iris" ? "Iris" : "Lagoon"} accent`}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <i className={s[value]} />
                {value === "iris" ? "Iris" : "Lagoon"}
              </button>
            ))}
          </div>
          <label className={s.range} htmlFor={`${uid}-radius`}>
            <span>
              Corner radius <output>{radius}px</output>
            </span>
            <input
              id={`${uid}-radius`}
              type="range"
              min="8"
              max="32"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </label>
        </OrbitCard>
        <OrbitCard
          label="Project activity"
          span={spans?.activity}
          className={s.activity}
        >
          <div className={s.cardTop}>
            <span className={s.kicker}>04 / STUDIO NOTES</span>
            <span className={s.kicker}>LOCAL</span>
          </div>
          <h3>{project.title}</h3>
          <p className={s.context}>
            {open.length} {open.length === 1 ? "step" : "steps"} remaining
          </p>
          <ol className={s.timeline}>
            {content.activity.map((a, i) => (
              <li key={a.id}>
                <span>{a.time}</span>
                <p>
                  {i === content.activity.length - 1
                    ? open[0]
                      ? `Next: ${open[0].label}`
                      : "Checklist complete. Ready for handoff."
                    : a.title}
                </p>
              </li>
            ))}
          </ol>
          <p className={s.receipt} role="status">
            {note || "The brief, index and checklist share this project."}
          </p>
        </OrbitCard>
        <OrbitCard
          label="Project progress controls"
          span={spans?.progress}
          className={s.progress}
        >
          <div className={s.cardTop}>
            <span className={s.kicker}>05 / THE CHECKLIST</span>
            <span className={s.kicker}>{progress}%</span>
          </div>
          <div className={s.progressHead}>
            <h3>
              Done /<br />
              to do.
            </h3>
            <strong>
              {project.tasks.length - open.length}
              <small>/{project.tasks.length}</small>
            </strong>
          </div>
          <progress
            aria-label={`${project.title} progress`}
            max="100"
            value={progress}
          />
          <div className={s.tasks}>
            {project.tasks.map((t) => (
              <label key={`${project.id}-${t.id}`}>
                <input
                  type="checkbox"
                  checked={isDone(t.id, t.done)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setTasks((previous) => ({
                      ...previous,
                      [`${project.id}:${t.id}`]: checked,
                    }));
                    setNote(
                      `${t.label} ${checked ? "completed" : "reopened"}.`,
                    );
                  }}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </OrbitCard>
        <OrbitCard
          label="Project details and actions"
          span={spans?.details}
          className={s.details}
        >
          <div className={s.cardTop}>
            <span className={s.kicker}>06 / NEXT IN LINE</span>
            <span className={s.kicker}>{number}</span>
          </div>
          <span className={s.detailCategory}>{project.category}</span>
          <h3>{project.title}</h3>
          <p>{open[0]?.label ?? "All steps complete. Ready for handoff."}</p>
          <span className={s.actionCaption}>
            {open.length
              ? `${open.length} steps remaining. Complete one to update the collection.`
              : "Every step is accounted for."}
          </span>
          <button className={s.action} onClick={completeNext}>
            {progress === 100 && project.tasks.length
              ? "All done. Take a breath."
              : "Complete next step"}
            <span aria-hidden="true">{open.length ? "+" : "✓"}</span>
          </button>
        </OrbitCard>
      </div>
    </div>
  );
}
