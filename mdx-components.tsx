import type { MDXComponents } from "mdx/types";

// Required by Next.js App Router for MDX support. We don't override any
// default elements here — the .prose-blog CSS in globals.css styles them.
// Add overrides here if we ever want a custom <CodeBlock>, <Callout>, etc.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
