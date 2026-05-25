"use client";

import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { RotateCcw, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ── Default starter code ──────────────────────────────────────────────────────

const DEFAULTS = {
  html: `<h1>Hello, Playground!</h1>
<p>Edit the HTML, CSS, and JS tabs then click <strong>Run</strong> to see your changes.</p>
<button id="btn">Click me</button>`,

  css: `body {
  font-family: system-ui, sans-serif;
  max-width: 640px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  line-height: 1.6;
}

h1 { color: steelblue; }

button {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: steelblue;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

button:hover { background: #2a7bbf; }`,

  js: `document.getElementById('btn').addEventListener('click', () => {
  alert('Hello from JavaScript!');
});`,
};

// ── Assemble the three files into a preview document ──────────────────────────

function assemblePreview(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  </script>
</body>
</html>`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "html" | "css" | "js";

const TAB_LABELS: Record<Tab, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

const MONACO_LANG: Record<Tab, string> = {
  html: "html",
  css: "css",
  js: "javascript",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PlaygroundEditor() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [code, setCode] = useState<Record<Tab, string>>({ ...DEFAULTS });
  const [preview, setPreview] = useState(() =>
    assemblePreview(DEFAULTS.html, DEFAULTS.css, DEFAULTS.js)
  );

  const handleChange = useCallback((tab: Tab, value: string) => {
    setCode((prev) => ({ ...prev, [tab]: value }));
  }, []);

  const handleRun = useCallback(() => {
    setCode((current) => {
      setPreview(assemblePreview(current.html, current.css, current.js));
      return current;
    });
  }, []);

  const handleReset = useCallback(() => {
    setCode({ ...DEFAULTS });
    setPreview(assemblePreview(DEFAULTS.html, DEFAULTS.css, DEFAULTS.js));
  }, []);

  return (
    // Fills viewport minus the navbar height (4rem = 64px)
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden border-t border-border">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-2">

        {/* File tabs */}
        <div className="flex items-center gap-1">
          {(["html", "css", "js"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-mono transition-colors",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset all files to starter code"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-7 gap-1.5 text-xs"
            )}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={handleRun}
            title="Run code and update preview"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-7 gap-1.5 text-xs"
            )}
          >
            <Play className="h-3 w-3" />
            Run
          </button>
        </div>
      </div>

      {/* ── Editor + Preview ─────────────────────────────────────── */}
      <div className="grid flex-1 grid-cols-1 divide-border overflow-hidden lg:grid-cols-2 lg:divide-x">

        {/* Monaco editor — remounts on tab switch; state stays in React */}
        <div className="overflow-hidden">
          <Editor
            key={activeTab}
            height="100%"
            language={MONACO_LANG[activeTab]}
            value={code[activeTab]}
            theme={isDark ? "vs-dark" : "vs"}
            onChange={(val) => handleChange(activeTab, val ?? "")}
            options={{
              fontSize: 13,
              lineHeight: 20,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              padding: { top: 12, bottom: 12 },
              lineDecorationsWidth: 8,
              overviewRulerLanes: 0,
              folding: false,
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col overflow-hidden">
          <p className="shrink-0 border-b border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            Preview — click <span className="font-semibold text-foreground">Run</span> to update
          </p>
          <iframe
            srcDoc={preview}
            sandbox="allow-scripts"
            className="flex-1 bg-white"
            title="Playground preview"
          />
        </div>
      </div>
    </div>
  );
}
