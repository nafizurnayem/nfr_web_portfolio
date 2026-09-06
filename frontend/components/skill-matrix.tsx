import type { Skill } from "@/lib/api";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";

/**
 * The stack, as a bento grid of category panels.
 *
 * This replaced a grid of 54 animated confidence bars. Two problems with that:
 * it was a lot of simultaneous motion for something a reader only scans, and a
 * bar rendered to two decimal places implies a precision that a self-assessment
 * does not have. Chips scan faster and claim less.
 *
 * Emphasis is carried by the panel, not by per-skill numbers: the primary
 * specialism gets a wider cell and an accent treatment, and the strongest few
 * skills in each category get a brighter chip. Order still comes from the
 * `proficiency` value in the database, so the data drives the display.
 */

/** Category that leads the section and gets the double-width cell. */
const PRIMARY_CATEGORY = "Image Processing & CV";

/** Skills at or above this proficiency get the accented chip. */
const CORE_THRESHOLD = 88;

export function SkillMatrix({
  skillsByCategory,
  orderedCategories,
}: {
  skillsByCategory: Record<string, Skill[]>;
  orderedCategories: string[];
}) {
  return (
    <div className="grid auto-rows-min grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {orderedCategories.map((category, index) => {
        const isPrimary = category === PRIMARY_CATEGORY;
        // Strongest first, so the most relevant names are read first.
        const skills = [...skillsByCategory[category]].sort(
          (a, b) => b.proficiency - a.proficiency
        );

        return (
          <Reveal
            key={category}
            delay={Math.min(index, 6) * 0.04}
            className={cn(isPrimary && "sm:col-span-2")}
          >
            <div
              className={cn(
                "model-card h-full p-5 transition-colors duration-200",
                isPrimary && "border-accent/25 bg-accent/[0.025]"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="layer-label">
                  <span className={isPrimary ? "text-accent" : "text-accent/60"}>::</span>{" "}
                  {category}
                </p>
                <span className="flex items-center gap-2">
                  {isPrimary && (
                    <span className="rounded-full border border-accent/40 bg-accent/[0.10] px-2 py-0.5 font-mono text-[11px] text-accent-soft">
                      primary focus
                    </span>
                  )}
                  <span className="tabular font-mono text-[11px] text-ink-300">
                    {skills.length}
                  </span>
                </span>
              </div>

              <ul
                className={cn(
                  "mt-4 flex flex-wrap gap-1.5",
                  isPrimary && "sm:gap-2"
                )}
              >
                {skills.map((skill) => {
                  const core = skill.proficiency >= CORE_THRESHOLD;
                  return (
                    <li key={skill.id}>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-200 sm:text-xs",
                          core
                            ? "border-accent/30 bg-accent/[0.08] text-accent-soft"
                            : "border-line/10 bg-surface/[0.05] text-ink-100"
                        )}
                      >
                        {/* A dot, not colour alone, marks the strongest skills. */}
                        {core && (
                          <span
                            aria-hidden
                            className="h-1 w-1 shrink-0 rounded-full bg-accent"
                          />
                        )}
                        {skill.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
