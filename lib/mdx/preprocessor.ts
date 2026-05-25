/**
 * MDX preprocessor — runs before compileMDX.
 *
 * Problem: <StartingCode> and <Solution> contain raw HTML documents
 * (including <!DOCTYPE html>) which are not valid JSX and would crash
 * the MDX compiler.
 *
 * Solution: extract their raw content and convert to a `code` string prop
 * before the compiler ever sees them.
 *
 * Before:
 *   <StartingCode>
 *   <!DOCTYPE html>
 *   <html>...
 *   </StartingCode>
 *
 * After:
 *   <StartingCode code={`<!DOCTYPE html>\n<html>...`} />
 */

function extractComponentContent(
  source: string,
  componentName: string
): string {
  const openTag = `<${componentName}>`;
  const closeTag = `</${componentName}>`;

  return source.replace(
    new RegExp(`${openTag}\\n([\\s\\S]*?)\\n${closeTag}`, "g"),
    (_, content: string) => {
      // Escape backticks and template literal interpolations
      const escaped = content
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "\\${");

      return `<${componentName} code={\`${escaped}\`} />`;
    }
  );
}

export function preprocessMdx(source: string): string {
  let processed = source;
  // Only StartingCode and Solution contain raw code that breaks the JSX parser.
  // Instructions and Validation contain plain text and are fine as children.
  processed = extractComponentContent(processed, "StartingCode");
  processed = extractComponentContent(processed, "Solution");
  return processed;
}
