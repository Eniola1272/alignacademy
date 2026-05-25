/**
 * Custom MDX component map.
 * Passed to compileMDX — these replace the JSX tags in lesson files.
 *
 * CodeExercise is now fully interactive (Monaco + live HTML preview).
 * StartingCode and Solution are no longer used as children — the preprocessor
 * hoists their code up to CodeExercise as startingCode/solutionCode props.
 * They are kept here as no-ops so old MDX files that still include them
 * won't crash during any transitional period.
 */

import type { ReactNode } from "react";
import { CodeExercise } from "@/components/course/code-exercise";

// ── <Hook> ────────────────────────────────────────────────────────────────────

export function Hook({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-lg border-l-4 border-primary bg-muted/50 px-5 py-4">
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

// ── <Instructions> ────────────────────────────────────────────────────────────
// Rendered inside CodeExercise as part of its children.

export function Instructions({ children }: { children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Instructions
      </p>
      <div className="text-sm leading-relaxed text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </div>
  );
}

// ── <Validation> ──────────────────────────────────────────────────────────────
// Rendered inside CodeExercise as part of its children.

export function Validation({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-md bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">Passes when: </span>
      {children}
    </div>
  );
}

// ── <StartingCode> / <Solution> ───────────────────────────────────────────────
// These are no longer rendered as children of CodeExercise — the preprocessor
// moves their content to props. Kept here as no-ops just in case.

interface CodePropComponent {
  code?: string;
  children?: ReactNode;
}

export function StartingCode(_props: CodePropComponent) {
  return null;
}

export function Solution(_props: CodePropComponent) {
  return null;
}

// ── Component map ─────────────────────────────────────────────────────────────

export const MDX_COMPONENTS = {
  Hook,
  CodeExercise,
  Instructions,
  Validation,
  StartingCode,
  Solution,
};
