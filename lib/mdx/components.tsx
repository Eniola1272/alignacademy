/**
 * Custom MDX component map.
 * These are passed to compileMDX and replace the JSX tags in lesson files.
 *
 * Phase 3: CodeExercise is a static read-only display.
 * Phase 4: Replace with the fully interactive Monaco-based version.
 */

import type { ReactNode } from "react";

// ── <Hook> ────────────────────────────────────────────────────────────────────

export function Hook({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-lg border-l-4 border-primary bg-muted/50 px-5 py-4">
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

// ── <CodeExercise> and sub-components ────────────────────────────────────────

interface CodeExerciseProps {
  language: string;
  children: ReactNode;
}

export function CodeExercise({ language, children }: CodeExerciseProps) {
  return (
    <div
      className="not-prose my-8 overflow-hidden rounded-lg border border-border"
      data-language={language}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="text-xs font-mono text-muted-foreground">
          Exercise · {language}
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Phase 4: interactive editor coming soon
        </span>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export function Instructions({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Instructions
      </p>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

interface CodePropComponent {
  code?: string;
  children?: ReactNode;
}

export function StartingCode({ code, children }: CodePropComponent) {
  const content = code ?? (typeof children === "string" ? children : "");
  return (
    <div className="px-4 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Starting code
      </p>
      <pre className="overflow-x-auto rounded-md bg-background p-4 text-xs leading-relaxed font-mono border border-border">
        <code>{content}</code>
      </pre>
    </div>
  );
}

export function Solution({ code, children }: CodePropComponent) {
  const content = code ?? (typeof children === "string" ? children : "");
  return (
    <details className="px-4 py-4">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        Show solution ▸
      </summary>
      <pre className="mt-3 overflow-x-auto rounded-md bg-background p-4 text-xs leading-relaxed font-mono border border-border">
        <code>{content}</code>
      </pre>
    </details>
  );
}

export function Validation({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Passes when: </span>
        {children}
      </p>
    </div>
  );
}

// ── Component map ─────────────────────────────────────────────────────────────

export const MDX_COMPONENTS = {
  Hook,
  CodeExercise,
  Instructions,
  StartingCode,
  Solution,
  Validation,
};
