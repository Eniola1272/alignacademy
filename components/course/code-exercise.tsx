"use client";

/**
 * Interactive code exercise — Monaco editor + live HTML preview.
 *
 * Receives `startingCode` and `solutionCode` as pre-escaped string props
 * (hoisted by the MDX preprocessor). Instructions and Validation are
 * rendered server-side and passed through as `children`.
 */

import { useCallback, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { RotateCcw, Play, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { ReactNode } from "react";
import type { editor as MonacoEditor } from "monaco-editor";

interface CodeExerciseProps {
  language?: string;
  startingCode?: string;
  solutionCode?: string;
  children?: ReactNode; // <Instructions> and <Validation>
}

// ── Monaco language id ──────────────────────────────────────────────────────

function monacoLanguage(lang: string): string {
  const map: Record<string, string> = {
    html: "html",
    css: "css",
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
    python: "python",
  };
  return map[lang.toLowerCase()] ?? lang;
}

// ── Component ───────────────────────────────────────────────────────────────

export function CodeExercise({
  language = "html",
  startingCode = "",
  solutionCode,
  children,
}: CodeExerciseProps) {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(startingCode);
  const [preview, setPreview] = useState(startingCode);
  const [showSolution, setShowSolution] = useState(false);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

  const isDark = resolvedTheme === "dark";

  const handleEditorMount = useCallback(
    (ed: MonacoEditor.IStandaloneCodeEditor) => {
      editorRef.current = ed;
    },
    []
  );

  const handleRun = useCallback(() => {
    setPreview(code);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(startingCode);
    setPreview(startingCode);
    editorRef.current?.setValue(startingCode);
  }, [startingCode]);

  const handleShowSolution = useCallback(() => {
    if (!solutionCode) return;
    setShowSolution((s) => {
      const next = !s;
      if (next) {
        // Load solution into editor and preview
        setCode(solutionCode);
        setPreview(solutionCode);
        editorRef.current?.setValue(solutionCode);
      } else {
        // Restore starting code
        setCode(startingCode);
        setPreview(startingCode);
        editorRef.current?.setValue(startingCode);
      }
      return next;
    });
  }, [solutionCode, startingCode]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-lg border border-border">
      {/* ── Header bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <span className="text-xs font-mono text-muted-foreground">
          Exercise · {language}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 gap-1.5 text-xs"
            )}
            title="Reset to starting code"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={handleRun}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-7 gap-1.5 text-xs"
            )}
            title="Run code and update preview"
          >
            <Play className="h-3 w-3" />
            Run
          </button>
        </div>
      </div>

      {/* ── Instructions ────────────────────────────────────── */}
      {children && (
        <div className="border-b border-border px-5 py-4 text-sm leading-relaxed">
          {children}
        </div>
      )}

      {/* ── Editor + Preview split ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Editor */}
        <div className="min-h-[280px]">
          <Editor
            height="320px"
            language={monacoLanguage(language)}
            value={code}
            theme={isDark ? "vs-dark" : "vs"}
            onChange={(val) => setCode(val ?? "")}
            onMount={handleEditorMount}
            options={{
              fontSize: 13,
              lineHeight: 20,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              renderLineHighlight: "line",
              overviewRulerLanes: 0,
              folding: false,
              lineDecorationsWidth: 8,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <p className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-muted/20">
            Preview
          </p>
          <iframe
            srcDoc={preview}
            sandbox="allow-scripts"
            className="flex-1 min-h-[280px] w-full bg-white"
            title="Exercise preview"
          />
        </div>
      </div>

      {/* ── Footer: Validation + Solution toggle ─────────────── */}
      <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-5 py-3">
        <p className="text-xs text-muted-foreground leading-relaxed" />

        {solutionCode && (
          <button
            onClick={handleShowSolution}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 shrink-0 gap-1.5 text-xs"
            )}
          >
            {showSolution ? (
              <>
                <EyeOff className="h-3 w-3" />
                Hide solution
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                Show solution
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
