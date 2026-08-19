import { notFound, redirect } from "next/navigation";
import { ALL_TOOLS, findTool, SLUG_REDIRECTS, SITE } from "@/lib/tools";
import { buildMetadata } from "@/lib/seo";
import { StubTool } from "@/components/ToolPage";
import { getToolImpl } from "@/components/tools/registry";

// Build pages for both live tools and old redirect slugs so links don't 404.
export function generateStaticParams() {
  return [
    ...ALL_TOOLS.map((t) => ({ slug: t.slug })),
    ...Object.keys(SLUG_REDIRECTS).map((slug) => ({ slug })),
  ];
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const target = SLUG_REDIRECTS[params.slug];
  if (target) {
    const dest = `${SITE.url}/tools/${target}/`;
    return {
      title: "Redirecting…",
      robots: { index: false, follow: true } as any,
      alternates: { canonical: dest },
      other: { refresh: `0; url=${dest}` },
    };
  }
  const tool = findTool(params.slug);
  if (!tool) return {};
  return buildMetadata({
    title: tool.title,
    description: tool.description,
    path: `/tools/${tool.slug}/`,
    keywords: tool.keywords,
    ogImageAlt: tool.title,
    noindex: !tool.indexed,
  });
}

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  // Old slugs we removed during the dedup pass — render a small redirect page.
  const target = SLUG_REDIRECTS[params.slug];
  if (target) {
    // Static export can't issue a server redirect, so emit a tiny meta-refresh
    // document. The metadata above sets the http-equiv refresh header; this body
    // is the visible fallback if the browser ignores it.
    const dest = `/tools/${target}/`;
    return (
      <div className="text-center py-24">
        <p className="text-sm text-[rgb(var(--fg-muted))]">This tool has moved.</p>
        <a href={dest} className="mt-2 inline-block text-brand-600 underline">Go to its replacement →</a>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(dest)});` }} />
      </div>
    );
  }

  const tool = findTool(params.slug);
  if (!tool) notFound();

  // Working tools resolve to a real component; stubs render the coming-soon page.
  const Impl = getToolImpl(tool.slug);
  if (!Impl) return <StubTool tool={tool} />;
  return <Impl tool={tool} />;
}
