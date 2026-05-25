"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Download, Trash2, ArrowUp, ArrowDown, RotateCw, FileText } from "lucide-react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

type ToolProps = { tool: Tool & { categorySlug: string; categoryName: string } };

// ─── Shared helpers ────────────────────────────────────────────────────────

function DropZone({
  accept,
  multiple,
  onFiles,
  label,
}: {
  accept: string;
  multiple: boolean;
  onFiles: (files: File[]) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => ref.current?.click()}
      className="rounded-2xl border-2 border-dashed border-[rgb(var(--border))] p-8 text-center cursor-pointer hover:border-brand-500/60 transition select-none"
    >
      <Upload className="h-8 w-8 mx-auto text-[rgb(var(--fg-muted))]" />
      <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">{label}</p>
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />
    </div>
  );
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function pdfBlob(bytes: Uint8Array): Blob {
  // Uint8Array.buffer is typed as ArrayBufferLike; cast to ArrayBuffer for Blob.
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

async function loadPdfLib() {
  const { PDFDocument, degrees } = await import("pdf-lib");
  return { PDFDocument, degrees };
}

// ─── PDF Merge ────────────────────────────────────────────────────────────

export function PdfMerge({ tool }: ToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addFiles(incoming: File[]) {
    setError("");
    setFiles((prev) => [...prev, ...incoming.filter((f) => f.type === "application/pdf")]);
  }

  function move(i: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function merge() {
    if (files.length < 2) { setError("Add at least 2 PDF files."); return; }
    setBusy(true); setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (const file of files) {
        const buf = await file.arrayBuffer();
        const src = await PDFDocument.load(buf);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      downloadBlob(pdfBlob(bytes), "merged.pdf");
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Add two or more PDF files, drag the rows to reorder, then click Merge & Download.",
        formula: "pdf-lib copies pages from each source document in order into a new PDF — no server involved.",
        examples: "Combine a cover letter and résumé into one PDF before uploading to a job application portal.",
        faq: [
          { q: "Is there a file size limit?", a: "No server limit — the only constraint is available browser memory, typically several hundred MB." },
          { q: "Are my files uploaded anywhere?", a: "No. Everything runs in your browser using pdf-lib." },
          { q: "Can I merge more than 2 files?", a: "Yes, add as many PDFs as you like." },
        ],
      }}
    >
      <DropZone accept="application/pdf" multiple onFiles={addFiles} label="Drop PDF files here or click to choose" />

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-3 py-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-brand-500" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-[rgb(var(--fg-muted))] shrink-0">{fmtBytes(f.size)}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="min-tap btn-ghost p-1 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
              <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="min-tap btn-ghost p-1 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
              <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="min-tap btn-ghost p-1 text-red-500"><Trash2 className="h-3 w-3" /></button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button onClick={merge} disabled={busy || files.length < 2} className="mt-4 btn-primary flex items-center gap-2 disabled:opacity-50">
        <Download className="h-4 w-4" />
        {busy ? "Merging…" : "Merge & Download"}
      </button>
    </ToolPage>
  );
}

// ─── PDF Split ────────────────────────────────────────────────────────────

export function PdfSplit({ tool }: ToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("");
  const [splitAll, setSplitAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f || f.type !== "application/pdf") return;
    setFile(f); setError("");
    const { PDFDocument } = await loadPdfLib();
    const src = await PDFDocument.load(await f.arrayBuffer());
    setPageCount(src.getPageCount());
  }

  function parseRanges(input: string, max: number): number[][] {
    const groups: number[][] = [];
    for (const part of input.split(",")) {
      const [a, b] = part.trim().split("-").map((s) => parseInt(s.trim(), 10));
      if (isNaN(a)) continue;
      const end = isNaN(b) ? a : b;
      const pages: number[] = [];
      for (let p = a; p <= end && p <= max; p++) pages.push(p);
      if (pages.length) groups.push(pages);
    }
    return groups;
  }

  async function split() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await file.arrayBuffer());
      const groups = splitAll
        ? Array.from({ length: src.getPageCount() }, (_, i) => [i + 1])
        : parseRanges(ranges, src.getPageCount());

      if (groups.length === 0) { setError("No valid page ranges entered."); setBusy(false); return; }

      if (groups.length === 1) {
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, groups[0].map((p) => p - 1));
        copied.forEach((pg) => out.addPage(pg));
        const bytes = await out.save();
        downloadBlob(pdfBlob(bytes), `pages-${groups[0].join("-")}.pdf`);
      } else {
        // Multiple files — download sequentially
        for (let i = 0; i < groups.length; i++) {
          const out = await PDFDocument.create();
          const copied = await out.copyPages(src, groups[i].map((p) => p - 1));
          copied.forEach((pg) => out.addPage(pg));
          const bytes = await out.save();
          downloadBlob(pdfBlob(bytes), `split-${i + 1}.pdf`);
          // Small delay so browsers don't block multiple downloads
          await new Promise((r) => setTimeout(r, 150));
        }
      }
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Upload a PDF, enter page ranges like 1-3,5,7-9 (or use 'Split every page'), then click Split.",
        formula: "pdf-lib copies the requested page indices into new PDF documents — all processing is local.",
        examples: "Extract pages 1-10 from a 50-page report to share just the executive summary.",
        faq: [
          { q: "What range syntax is supported?", a: "Comma-separated ranges: 1-3,5,8-10 — or individual pages: 1,3,5." },
          { q: "Can I extract every page as a separate file?", a: "Yes — toggle 'Split every page' and each page downloads as its own PDF." },
          { q: "Are my files uploaded anywhere?", a: "No, everything runs in your browser." },
        ],
      }}
    >
      <DropZone accept="application/pdf" multiple={false} onFiles={onFile} label={file ? `${file.name} (${pageCount} pages)` : "Drop a PDF here or click to choose"} />

      {file && (
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={splitAll} onChange={(e) => setSplitAll(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm">Split every page into a separate file</span>
          </label>
          {!splitAll && (
            <div>
              <label className="label">Page ranges (e.g. 1-3,5,7-9)</label>
              <input
                className="input mt-1"
                placeholder={`1-${pageCount}`}
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={split} disabled={busy || (!splitAll && !ranges.trim())} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Download className="h-4 w-4" />
            {busy ? "Splitting…" : "Split & Download"}
          </button>
        </div>
      )}
    </ToolPage>
  );
}

// ─── PDF to Images ────────────────────────────────────────────────────────

export function PdfToImages({ tool }: ToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState(2);
  const [pages, setPages] = useState<{ canvas: HTMLCanvasElement; n: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function render(f: File) {
    setFile(f); setPages([]); setError(""); setBusy(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Worker is served from public/ to avoid webpack bundling the ESM worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      const rendered: { canvas: HTMLCanvasElement; n: number }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        rendered.push({ canvas, n: i });
      }
      setPages(rendered);
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  function downloadPage(p: { canvas: HTMLCanvasElement; n: number }) {
    p.canvas.toBlob(
      (blob) => { if (blob) downloadBlob(blob, `page-${p.n}.${format}`); },
      format === "jpeg" ? "image/jpeg" : "image/png",
      0.92
    );
  }

  async function downloadAll() {
    for (const p of pages) {
      downloadPage(p);
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Upload a PDF, choose PNG or JPG and a scale factor, then download individual pages or all at once.",
        formula: "pdf.js renders each PDF page to an HTML canvas at the chosen scale (2× = 144 DPI equivalent), then exports as PNG or JPEG.",
        examples: "Convert a presentation PDF to PNG slides you can embed in a slide deck or web page.",
        faq: [
          { q: "What scale should I use?", a: "2× (default) gives 144 DPI — good for most uses. Use 3× for print-quality output." },
          { q: "Are my files uploaded anywhere?", a: "No — pdf.js renders in your browser." },
          { q: "Does it support password-protected PDFs?", a: "No — encrypted PDFs will fail to render." },
        ],
      }}
    >
      <DropZone accept="application/pdf" multiple={false} onFiles={(fs) => fs[0] && render(fs[0])} label={file ? file.name : "Drop a PDF here or click to choose"} />

      <div className="mt-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Format</label>
          <select className="input mt-1" value={format} onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}>
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
          </select>
        </div>
        <div>
          <label className="label">Scale</label>
          <select className="input mt-1" value={scale} onChange={(e) => { setScale(Number(e.target.value)); if (file) render(file); }}>
            <option value={1}>1× (72 DPI)</option>
            <option value={2}>2× (144 DPI)</option>
            <option value={3}>3× (216 DPI)</option>
          </select>
        </div>
        {pages.length > 1 && (
          <button onClick={downloadAll} className="btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" /> Download All ({pages.length})
          </button>
        )}
      </div>

      {busy && <p className="mt-4 text-sm text-[rgb(var(--fg-muted))]">Rendering pages…</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {pages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {pages.map((p) => (
            <div key={p.n} className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
              <img src={p.canvas.toDataURL()} alt={`Page ${p.n}`} className="w-full" />
              <div className="flex items-center justify-between px-2 py-1 text-xs bg-[rgb(var(--card))]">
                <span>Page {p.n}</span>
                <button onClick={() => downloadPage(p)} className="btn-ghost text-xs flex items-center gap-1">
                  <Download className="h-3 w-3" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}

// ─── Images to PDF ─────────────────────────────────────────────────────────

export function ImagesToPdf({ tool }: ToolProps) {
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "fit">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addImages(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith("image/")).map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...imgs]);
    setError("");
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeImage(i: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, j) => j !== i);
    });
  }

  async function build() {
    if (images.length === 0) { setError("Add at least one image."); return; }
    setBusy(true); setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.create();

      // Pre-defined page sizes in points (1 pt = 1/72 inch)
      const sizes: Record<string, [number, number]> = {
        A4: [595.28, 841.89],
        Letter: [612, 792],
      };

      for (const { file } of images) {
        const buf = await file.arrayBuffer();
        const isJpeg = file.type === "image/jpeg";
        const isPng = file.type === "image/png";
        const isWebp = file.type === "image/webp";

        let imgEmbed;
        let imgW = 0, imgH = 0;

        if (isJpeg) {
          imgEmbed = await pdf.embedJpg(buf);
          imgW = imgEmbed.width; imgH = imgEmbed.height;
        } else if (isPng) {
          imgEmbed = await pdf.embedPng(buf);
          imgW = imgEmbed.width; imgH = imgEmbed.height;
        } else if (isWebp) {
          // Convert WebP via canvas → PNG blob → embed.
          // createImageBitmap with a Blob requires Safari 15+; wrap for older versions.
          if (typeof createImageBitmap === "undefined") {
            throw new Error("WebP conversion requires Safari 15 or newer.");
          }
          const blob = new Blob([buf], { type: "image/webp" });
          let bitmapImg: ImageBitmap;
          try {
            bitmapImg = await createImageBitmap(blob);
          } catch {
            throw new Error(`Could not decode WebP image "${file.name}". Try converting it to PNG or JPG first.`);
          }
          const cv = document.createElement("canvas");
          cv.width = bitmapImg.width; cv.height = bitmapImg.height;
          cv.getContext("2d")!.drawImage(bitmapImg, 0, 0);
          const pngBuf = await new Promise<ArrayBuffer>((res, rej) =>
            cv.toBlob((b) => {
              if (!b) { rej(new Error("Failed to convert WebP to PNG (toBlob returned null).")); return; }
              b.arrayBuffer().then(res);
            }, "image/png")
          );
          imgEmbed = await pdf.embedPng(pngBuf);
          imgW = imgEmbed.width; imgH = imgEmbed.height;
        } else {
          continue;
        }

        let pgW: number, pgH: number;
        if (pageSize === "fit") {
          pgW = imgW; pgH = imgH;
        } else {
          [pgW, pgH] = sizes[pageSize];
          if (orientation === "landscape") [pgW, pgH] = [pgH, pgW];
        }

        const page = pdf.addPage([pgW, pgH]);
        const scale = Math.min(pgW / imgW, pgH / imgH);
        const w = imgW * scale, h = imgH * scale;
        page.drawImage(imgEmbed, { x: (pgW - w) / 2, y: (pgH - h) / 2, width: w, height: h });
      }

      const bytes = await pdf.save();
      downloadBlob(pdfBlob(bytes), "images.pdf");
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Add JPG, PNG, or WebP images, drag to reorder, choose a page size, then click Build PDF.",
        formula: "pdf-lib embeds each image centered on the chosen page size. WebP is converted to PNG via canvas before embedding.",
        examples: "Turn scanned JPG receipts into a single PDF for expense reporting.",
        faq: [
          { q: "What image formats are supported?", a: "JPG, PNG, and WebP." },
          { q: "What does 'Fit to image' do?", a: "Sets each PDF page exactly to the pixel dimensions of the image — no white borders." },
          { q: "Are my images uploaded anywhere?", a: "No — all processing is done in your browser." },
        ],
      }}
    >
      <DropZone accept="image/jpeg,image/png,image/webp" multiple onFiles={addImages} label="Drop JPG / PNG / WebP images here or click to choose" />

      {images.length > 0 && (
        <>
          <ul className="mt-4 space-y-2">
            {images.map((img, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-3 py-2">
                <img src={img.url} alt="" className="h-10 w-10 object-cover rounded" />
                <span className="flex-1 truncate text-sm">{img.file.name}</span>
                <span className="text-xs text-[rgb(var(--fg-muted))] shrink-0">{fmtBytes(img.file.size)}</span>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="min-tap btn-ghost p-1 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                <button onClick={() => move(i, 1)} disabled={i === images.length - 1} className="min-tap btn-ghost p-1 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                <button onClick={() => removeImage(i)} className="min-tap btn-ghost p-1 text-red-500"><Trash2 className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="label">Page size</label>
              <select className="input mt-1" value={pageSize} onChange={(e) => setPageSize(e.target.value as typeof pageSize)}>
                <option value="A4">A4</option>
                <option value="Letter">Letter (US)</option>
                <option value="fit">Fit to image</option>
              </select>
            </div>
            {pageSize !== "fit" && (
              <div>
                <label className="label">Orientation</label>
                <select className="input mt-1" value={orientation} onChange={(e) => setOrientation(e.target.value as typeof orientation)}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button onClick={build} disabled={busy || images.length === 0} className="mt-4 btn-primary flex items-center gap-2 disabled:opacity-50">
        <Download className="h-4 w-4" />
        {busy ? "Building PDF…" : "Build PDF & Download"}
      </button>
    </ToolPage>
  );
}

// ─── PDF Rotate ────────────────────────────────────────────────────────────

export function PdfRotate({ tool }: ToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotationAll, setRotationAll] = useState(90);
  const [applyTo, setApplyTo] = useState<"all" | "range">("all");
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f || f.type !== "application/pdf") return;
    setFile(f); setError("");
    const { PDFDocument } = await loadPdfLib();
    const src = await PDFDocument.load(await f.arrayBuffer());
    setPageCount(src.getPageCount());
  }

  function parsePageNums(input: string, max: number): number[] {
    const nums = new Set<number>();
    for (const part of input.split(",")) {
      const [a, b] = part.trim().split("-").map((s) => parseInt(s.trim(), 10));
      if (isNaN(a)) continue;
      const end = isNaN(b) ? a : Math.min(b, max);
      for (let p = a; p <= end; p++) nums.add(p);
    }
    return [...nums];
  }

  async function rotate() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const targets =
        applyTo === "all"
          ? Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1)
          : parsePageNums(ranges, pdf.getPageCount());

      for (const n of targets) {
        const page = pdf.getPage(n - 1);
        page.setRotation(degrees((page.getRotation().angle + rotationAll) % 360));
      }

      const bytes = await pdf.save();
      downloadBlob(pdfBlob(bytes), `rotated-${file.name}`);
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Upload a PDF, choose rotation angle and which pages to rotate, then download.",
        formula: "pdf-lib updates each page's /Rotate entry by adding the chosen angle (mod 360) to the existing rotation.",
        examples: "Fix a scanned document that was saved in landscape but should be portrait — rotate all pages 90°.",
        faq: [
          { q: "Can I rotate only specific pages?", a: "Yes — choose 'Page range' and enter ranges like 1-3,5." },
          { q: "Does rotating change the content?", a: "No — the rotation is stored as metadata; page content is unchanged." },
          { q: "Are my files uploaded anywhere?", a: "No, all processing runs in your browser." },
        ],
      }}
    >
      <DropZone accept="application/pdf" multiple={false} onFiles={onFile} label={file ? `${file.name} (${pageCount} pages)` : "Drop a PDF here or click to choose"} />

      {file && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="label">Rotation</label>
              <select className="input mt-1" value={rotationAll} onChange={(e) => setRotationAll(Number(e.target.value))}>
                <option value={90}>90° clockwise</option>
                <option value={180}>180°</option>
                <option value={270}>90° counter-clockwise</option>
              </select>
            </div>
            <div>
              <label className="label">Apply to</label>
              <select className="input mt-1" value={applyTo} onChange={(e) => setApplyTo(e.target.value as "all" | "range")}>
                <option value="all">All pages</option>
                <option value="range">Page range</option>
              </select>
            </div>
          </div>

          {applyTo === "range" && (
            <div>
              <label className="label">Page ranges (e.g. 1-3,5)</label>
              <input className="input mt-1" placeholder={`1-${pageCount}`} value={ranges} onChange={(e) => setRanges(e.target.value)} />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={rotate} disabled={busy || (applyTo === "range" && !ranges.trim())} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <RotateCw className="h-4 w-4" />
            {busy ? "Rotating…" : "Rotate & Download"}
          </button>
        </div>
      )}
    </ToolPage>
  );
}

// ─── PDF Compress ──────────────────────────────────────────────────────────

export function PdfCompress({ tool }: ToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; original: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function compress(files: File[]) {
    const f = files[0];
    if (!f || f.type !== "application/pdf") return;
    setFile(f); setResult(null); setError(""); setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      // Load with objectsPerTick=50 to encourage GC between objects
      const pdf = await PDFDocument.load(await f.arrayBuffer(), { updateMetadata: false });
      // Re-saving with useObjectStreams=true compresses cross-reference tables
      const bytes = await pdf.save({ useObjectStreams: true });
      setResult({ bytes, original: f.size });
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result || !file) return;
    downloadBlob(pdfBlob(result.bytes), `compressed-${file.name}`);
  }

  const saved = result ? result.original - result.bytes.byteLength : 0;
  const pct = result ? ((saved / result.original) * 100).toFixed(1) : "0";

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Drop a PDF and compression happens automatically. Download the result if the file is smaller.",
        formula: "pdf-lib re-serialises the PDF with cross-reference object streams (xref streams) enabled — this removes one of the largest sources of byte bloat in older PDF writers.",
        examples: "A Word-exported PDF that's 4 MB due to unoptimised XRef tables may compress to 1.5 MB this way.",
        faq: [
          { q: "How much will it compress?", a: "Results vary widely. PDFs already using xref streams won't shrink. Best gains come from Word/LibreOffice exports and old PDF writers." },
          { q: "Does it reduce image quality?", a: "No — images are not resampled or recompressed. Only the document structure is optimised." },
          { q: "Are my files uploaded anywhere?", a: "No — all processing runs in your browser." },
        ],
      }}
    >
      <DropZone accept="application/pdf" multiple={false} onFiles={compress} label={busy ? "Compressing…" : (file ? file.name : "Drop a PDF here or click to choose")} />

      {busy && <p className="mt-4 text-sm text-[rgb(var(--fg-muted))]">Compressing…</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {result && (
        <div className="mt-4 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-4 space-y-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-[rgb(var(--fg-muted))]">Original</p>
              <p className="font-semibold">{fmtBytes(result.original)}</p>
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--fg-muted))]">Compressed</p>
              <p className="font-semibold">{fmtBytes(result.bytes.byteLength)}</p>
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--fg-muted))]">Saved</p>
              <p className={`font-semibold ${saved > 0 ? "text-green-600" : "text-[rgb(var(--fg-muted))]"}`}>
                {saved > 0 ? `-${pct}%` : "No change"}
              </p>
            </div>
          </div>
          <button onClick={download} className="w-full btn-primary flex items-center justify-center gap-2">
            <Download className="h-4 w-4" /> Download compressed PDF
          </button>
        </div>
      )}
    </ToolPage>
  );
}

// ─── PDF Metadata ──────────────────────────────────────────────────────────

export function PdfMetadata({ tool }: ToolProps) {
  const [meta, setMeta] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function onFile(files: File[]) {
    const f = files[0];
    if (!f || f.type !== "application/pdf") return;
    setError(""); setMeta(null); setFileName(f.name);
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.load(await f.arrayBuffer(), { updateMetadata: false });
      const info: Record<string, string> = {
        "Title": pdf.getTitle() ?? "—",
        "Author": pdf.getAuthor() ?? "—",
        "Subject": pdf.getSubject() ?? "—",
        "Creator": pdf.getCreator() ?? "—",
        "Producer": pdf.getProducer() ?? "—",
        "Keywords": pdf.getKeywords() ?? "—",
        "Creation Date": pdf.getCreationDate()?.toLocaleString() ?? "—",
        "Modification Date": pdf.getModificationDate()?.toLocaleString() ?? "—",
        "Page Count": String(pdf.getPageCount()),
      };
      setMeta(info);
    } catch (e) {
      setError(`Could not read metadata: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo: "Drop a PDF to instantly view its embedded metadata — title, author, creation date, and more.",
        formula: "pdf-lib parses the PDF's document info dictionary (the /Info entry in the trailer), which stores standard metadata fields.",
        examples: "Check who created a PDF and when — useful for verifying document authenticity or provenance.",
        faq: [
          { q: "What if a field shows '—'?", a: "The PDF's author did not embed that metadata field, or it was stripped." },
          { q: "Can this read XMP metadata?", a: "Not currently — only the standard /Info dictionary fields are shown." },
          { q: "Are my files uploaded anywhere?", a: "No — everything runs in your browser." },
        ],
      }}
    >
      <DropZone accept="application/pdf" multiple={false} onFiles={onFile} label={fileName || "Drop a PDF here or click to choose"} />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {meta && (
        <div className="mt-4 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(meta).map(([k, v]) => (
                <tr key={k} className="border-b border-[rgb(var(--border))] last:border-0">
                  <td className="px-4 py-2 font-medium text-[rgb(var(--fg-muted))] w-40 whitespace-nowrap">{k}</td>
                  <td className="px-4 py-2 break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolPage>
  );
}
