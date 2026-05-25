/**
 * MDX preprocessor — runs before compileMDX.
 *
 * Problem: <StartingCode> and <Solution> contain raw HTML documents
 * (including <!DOCTYPE html>) which are not valid JSX and would crash
 * the MDX compiler.
 *
 * Solution: extract their raw content and hoist them onto <CodeExercise>
 * as `startingCode` and `solutionCode` string props, then remove the
 * child components. <Instructions> and <Validation> stay as children
 * (they contain plain text and compile fine).
 *
 * Before:
 *   <CodeExercise language="html">
 *   <Instructions>…</Instructions>
 *   <StartingCode>
 *   <!DOCTYPE html>
 *   …
 *   </StartingCode>
 *   <Solution>
 *   <!DOCTYPE html>
 *   …
 *   </Solution>
 *   <Validation>…</Validation>
 *   </CodeExercise>
 *
 * After:
 *   <CodeExercise language="html" startingCode={`…`} solutionCode={`…`}>
 *   <Instructions>…</Instructions>
 *   <Validation>…</Validation>
 *   </CodeExercise>
 */

function escapeForTemplateLiteral(content: string): string {
  return content
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

/**
 * Extract the inner text of one named block and return [escaped, sourceWithoutBlock].
 * Matches:  <ComponentName>\n{content}\n</ComponentName>
 */
function extractBlock(
  source: string,
  componentName: string
): { escaped: string; source: string } {
  const pattern = new RegExp(
    `<${componentName}>\\n([\\s\\S]*?)\\n<\\/${componentName}>`,
    "g"
  );

  let escaped = "";
  const cleaned = source.replace(pattern, (_, content: string) => {
    escaped = escapeForTemplateLiteral(content);
    return ""; // remove the block from source
  });

  return { escaped, source: cleaned };
}

export function preprocessMdx(source: string): string {
  // Match each <CodeExercise …>…</CodeExercise> block and transform it.
  return source.replace(
    /(<CodeExercise[^>]*>)([\s\S]*?)(<\/CodeExercise>)/g,
    (_, openTag: string, body: string, closeTag: string) => {
      // Hoist StartingCode and Solution into props on the opening tag.
      const { escaped: startingCode, source: body1 } = extractBlock(
        body,
        "StartingCode"
      );
      const { escaped: solutionCode, source: body2 } = extractBlock(
        body1,
        "Solution"
      );

      // Strip the trailing > so we can append new props.
      const tagBase = openTag.replace(/>$/, "");

      const newOpenTag =
        `${tagBase}` +
        (startingCode ? ` startingCode={\`${startingCode}\`}` : "") +
        (solutionCode ? ` solutionCode={\`${solutionCode}\`}` : "") +
        `>`;

      // Collapse the whitespace left behind after removing the blocks.
      const trimmedBody = body2.replace(/\n{3,}/g, "\n\n");

      return `${newOpenTag}${trimmedBody}${closeTag}`;
    }
  );
}
