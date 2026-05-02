"use client";

import { useMemo, useState } from "react";
import { ToolPage } from "../ToolPage";
import type { Tool } from "@/lib/tools";

export default function WordCounter({ tool }: { tool: Tool & { categorySlug: string; categoryName: string } }) {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(?:\s|$)/g)?.length ?? 1) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = text === "" ? 0 : text.split(/\n/).length;
    const reading = Math.max(1, Math.round(words / 225)); // average adult reading speed
    return { words, chars, charsNoSpace, sentences, paragraphs, lines, reading };
  }, [text]);

  const tiles = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "No spaces", value: stats.charsNoSpace },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Reading time", value: `${stats.reading} min` },
  ];

  return (
    <ToolPage
      tool={tool}
      content={{
        howTo:
          "Paste or type any text. Word, character, sentence, paragraph, and line counts update live, along with an estimated reading time at 225 words per minute (the average adult silent-reading rate).",
        formula:
          "Words: contiguous non-whitespace runs. Sentences: end-of-sentence punctuation followed by whitespace or end-of-text. Paragraphs: text blocks separated by a blank line. Reading time: words ÷ 225, rounded up to a minimum of 1 minute.",
        examples:
          'A 500-word article reads in about 2–3 minutes. The string "Hello, world." has 2 words, 13 characters (12 without space), and 1 sentence.',
        faq: [
          { q: "Are sentences detected perfectly?", a: "We use a simple rule (.!? + whitespace). Edge cases like 'Mr. Smith' may inflate the count slightly." },
          { q: "Is my text uploaded?", a: "No, it's all measured in your browser and never leaves your device." },
        ],
      }}
    >
      <div className="grid gap-4">
        <textarea
          className="input min-h-[220px]"
          placeholder="Paste or type your text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Text to analyze"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-[rgb(var(--border))] p-3 text-center">
              <div className="text-xs text-[rgb(var(--fg-muted))]">{t.label}</div>
              <div className="text-lg font-semibold tabular-nums">{t.value}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
