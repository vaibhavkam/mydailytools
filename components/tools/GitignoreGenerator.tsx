"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";
import { AutoTextarea } from "@/components/AutoTextarea";

// Curated common gitignore templates. Not exhaustive (gitignore.io has thousands)
// but covers the 90% case for typical projects.
const TEMPLATES: Record<string, string> = {
  Node: "# Node\nnode_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.pnpm-debug.log*\ndist/\nbuild/\n.next/\nout/\n.cache/\n*.tsbuildinfo\n.npm/\n.yarn/cache\n.yarn/install-state.gz\n",
  Python: "# Python\n__pycache__/\n*.py[cod]\n*$py.class\n*.so\n.venv/\nvenv/\nenv/\nbuild/\ndist/\n*.egg-info/\n.pytest_cache/\n.mypy_cache/\n.coverage\nhtmlcov/\n.tox/\n",
  Java: "# Java\n*.class\n*.jar\n*.war\ntarget/\nbuild/\n.gradle/\nout/\n.idea/\n*.iml\n.classpath\n.project\n.settings/\n",
  Go: "# Go\nvendor/\n*.exe\n*.test\n*.out\ngo.work\ncoverage.out\n",
  Rust: "# Rust\ntarget/\nCargo.lock\n",
  Ruby: "# Ruby\n.bundle/\nvendor/bundle/\nlog/*.log\ntmp/\n.rspec_status\nGemfile.lock\n",
  macOS: "# macOS\n.DS_Store\n.AppleDouble\n.LSOverride\nIcon\r\r\n._*\n.Spotlight-V100\n.Trashes\n",
  Windows: "# Windows\nThumbs.db\nehthumbs.db\nDesktop.ini\n$RECYCLE.BIN/\n",
  Linux: "# Linux\n*~\n.fuse_hidden*\n.directory\n.Trash-*\n",
  VSCode: "# VS Code\n.vscode/*\n!.vscode/settings.json\n!.vscode/launch.json\n!.vscode/extensions.json\n",
  IntelliJ: "# IntelliJ\n.idea/\n*.iml\n*.iws\n*.ipr\n.idea_modules/\n",
  Env: "# Env files\n.env\n.env.local\n.env.*.local\n",
  Logs: "# Logs\nlogs/\n*.log\n",
  TerraformAWS: "# Terraform\n.terraform/\n*.tfstate\n*.tfstate.*\n*.tfvars\ncrash.log\n",
  Docker: "# Docker\n.dockerignore\ndocker-compose.override.yml\n",
};

export default function GitignoreGenerator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [picked, setPicked] = useState<Set<string>>(new Set(["Node", "macOS", "VSCode", "Env"]));
  const out = useMemo(() => {
    const blocks = [...picked].sort().map((k) => TEMPLATES[k]).filter(Boolean);
    return blocks.join("\n");
  }, [picked]);

  function toggle(k: string) {
    setPicked((s) => {
      const next = new Set(s);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  function download() {
    const blob = new Blob([out], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = ".gitignore"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Tick every stack and tool your project uses. The combined .gitignore appears below — copy it or download as a file.",
      formula: "We concatenate curated templates for popular environments. Patterns inside each template are standard git pathspecs.",
      examples: "A Node project on macOS using VS Code: tick Node, macOS, VSCode, Env — that covers ~95% of typical noise files.",
      faq: [{ q: "Need a more obscure stack?", a: "github.com/github/gitignore has 200+ — paste from there. We curated the most common ones to keep this tool fast." }],
    }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.keys(TEMPLATES).map((k) => (
          <label key={k} className="rounded-xl border border-[rgb(var(--border))] px-3 py-2 flex items-center gap-2 cursor-pointer min-tap">
            <input type="checkbox" checked={picked.has(k)} onChange={() => toggle(k)} className="accent-brand-600" />
            <span className="text-sm">{k}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => navigator.clipboard.writeText(out)} className="btn-ghost text-xs">Copy</button>
        <button onClick={download} className="btn-primary min-tap">Download .gitignore</button>
      </div>
      <AutoTextarea className="input mt-3 min-h-[300px] font-mono text-xs" value={out} readOnly />
    </ToolPage>
  );
}
