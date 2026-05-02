"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type Mat = number[][];

function makeMat(r: number, c: number, fill = 0): Mat { return Array.from({ length: r }, () => Array(c).fill(fill)); }
function add(a: Mat, b: Mat): Mat | null { if (a.length !== b.length || a[0].length !== b[0].length) return null; return a.map((row, i) => row.map((v, j) => v + b[i][j])); }
function sub(a: Mat, b: Mat): Mat | null { if (a.length !== b.length || a[0].length !== b[0].length) return null; return a.map((row, i) => row.map((v, j) => v - b[i][j])); }
function mul(a: Mat, b: Mat): Mat | null {
  if (a[0].length !== b.length) return null;
  return a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));
}
function transpose(a: Mat): Mat { return a[0].map((_, j) => a.map((r) => r[j])); }
function det(a: Mat): number | null {
  if (a.length !== a[0].length) return null;
  const n = a.length;
  if (n === 1) return a[0][0];
  if (n === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  // Laplace expansion (fine for small n).
  let s = 0;
  for (let j = 0; j < n; j++) {
    const sub = a.slice(1).map((r) => r.filter((_, k) => k !== j));
    s += (j % 2 === 0 ? 1 : -1) * a[0][j] * (det(sub) ?? 0);
  }
  return s;
}

export default function MatrixCalculator({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [size, setSize] = useState({ r: 2, c: 2 });
  const [A, setA] = useState<Mat>(makeMat(2, 2, 1));
  const [B, setB] = useState<Mat>(makeMat(2, 2, 1));
  const [op, setOp] = useState<"add" | "sub" | "mul" | "transposeA" | "detA">("mul");

  function resize(r: number, c: number) {
    setSize({ r, c });
    setA((m) => Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => m[i]?.[j] ?? 0)));
    setB((m) => Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => m[i]?.[j] ?? 0)));
  }

  const result = useMemo<Mat | number | string | null>(() => {
    try {
      switch (op) {
        case "add": return add(A, B) ?? "Sizes must match";
        case "sub": return sub(A, B) ?? "Sizes must match";
        case "mul": return mul(A, B) ?? "Inner dims must match";
        case "transposeA": return transpose(A);
        case "detA": return det(A) ?? "Must be square";
      }
    } catch { return null; }
  }, [op, A, B]);

  function setCell(which: "A" | "B", i: number, j: number, v: string) {
    const x = parseFloat(v) || 0;
    const updater = (m: Mat) => m.map((row, ri) => row.map((c, ci) => (ri === i && ci === j ? x : c)));
    which === "A" ? setA(updater) : setB(updater);
  }

  return (
    <ToolPage tool={tool} content={{
      howTo: "Set the matrix size, fill in the cells, and pick an operation. Results render as a matrix or a scalar (for determinant).",
      formula: "Add/sub: element-wise. Multiply: rows × columns. Transpose: swap rows and columns. Determinant: Laplace expansion.",
      examples: "[[1,2],[3,4]] × [[5,6],[7,8]] = [[19,22],[43,50]]. det([[1,2],[3,4]]) = −2.",
      faq: [{ q: "Inverse?", a: "Not yet — file a request. For 2×2 it's trivial; larger sizes need pivoting and we kept this UI simple." }],
    }}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label className="text-sm flex items-center gap-1">Rows <input type="number" min={1} max={5} className="input !w-16 !py-1" value={size.r} onChange={(e) => resize(Number(e.target.value), size.c)} /></label>
        <label className="text-sm flex items-center gap-1">Cols <input type="number" min={1} max={5} className="input !w-16 !py-1" value={size.c} onChange={(e) => resize(size.r, Number(e.target.value))} /></label>
        <select className="input !w-auto" value={op} onChange={(e) => setOp(e.target.value as any)}>
          <option value="add">A + B</option><option value="sub">A − B</option><option value="mul">A × B</option>
          <option value="transposeA">Transpose A</option><option value="detA">det(A)</option>
        </select>
      </div>
      <MatrixGrid label="A" m={A} onChange={(i, j, v) => setCell("A", i, j, v)} />
      <MatrixGrid label="B" m={B} onChange={(i, j, v) => setCell("B", i, j, v)} />
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 p-4">
        <div className="text-xs text-brand-700 dark:text-brand-300 uppercase">Result</div>
        {Array.isArray(result) ? <MatrixGrid m={result as Mat} readOnly /> : <div className="text-2xl font-mono">{result}</div>}
      </div>
    </ToolPage>
  );
}

function MatrixGrid({ label, m, onChange, readOnly }: { label?: string; m: Mat; onChange?: (i: number, j: number, v: string) => void; readOnly?: boolean }) {
  return (
    <div className="mb-2">
      {label && <div className="text-xs font-semibold mb-1">{label}</div>}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${m[0]?.length ?? 1}, minmax(0, 1fr))` }}>
        {m.map((row, i) => row.map((v, j) =>
          readOnly
            ? <div key={`${i}-${j}`} className="rounded-lg border border-[rgb(var(--border))] px-2 py-1.5 text-center font-mono text-sm">{Number(v.toPrecision(8))}</div>
            : <input key={`${i}-${j}`} className="input !py-1.5 text-center font-mono" value={v} onChange={(e) => onChange?.(i, j, e.target.value)} />
        ))}
      </div>
    </div>
  );
}
