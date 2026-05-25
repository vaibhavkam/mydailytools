import { ALL_TOOLS, SITE } from "@/lib/tools";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { AllToolsClient } from "@/components/AllToolsClient";

export const metadata = buildMetadata({
  title: "Free Online Tools Directory",
  description: `Browse all ${ALL_TOOLS.length}+ free online tools at MyDailyTool — calculators, unit converters, developer utilities, text tools, and more. No signup required, runs in your browser.`,
  path: "/tools/",
  keywords: ["free online tools", "all tools", "calculators", "converters", "developer tools", "text tools"],
});

export default function AllToolsPage() {
  const ld = itemListJsonLd(
    ALL_TOOLS.map((t) => ({
      name: t.title,
      url: `${SITE.url}/tools/${t.slug}/`,
      description: t.description,
    }))
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AllToolsClient />
    </>
  );
}
