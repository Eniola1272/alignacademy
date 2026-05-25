import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import type { CompileOptions } from "@mdx-js/mdx";

const prettyCodeOptions: PrettyCodeOptions = {
  // Dual theme: browsers select via [data-theme] + CSS (see globals.css)
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  // Add a language label to code blocks
  onVisitTitle(element) {
    element.properties.className = ["code-title"];
  },
  // Highlight specific lines
  onVisitHighlightedLine(element) {
    element.properties.className = ["highlighted-line"];
  },
};

export const MDX_OPTIONS: CompileOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
};
