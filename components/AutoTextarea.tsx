"use client";

import { useEffect, useRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number; // minimum visible rows (default 5)
};

// Drop-in replacement for <textarea> that auto-sizes to content.
// Keeps a min-height so empty textareas don't collapse, and grows
// without limit as content is pasted or typed.
export function AutoTextarea({ minRows = 5, style, value, onChange, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  // Resize whenever controlled value changes (paste, programmatic update).
  useEffect(() => {
    resize();
  }, [value]);

  // Resize on first mount so pre-filled textareas start at the right size.
  useEffect(() => {
    resize();
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      style={{
        minHeight: `${minRows * 1.625}rem`, // ~1.625rem per row at text-sm line-height
        resize: "none",
        overflowY: "hidden",
        ...style,
      }}
      {...rest}
    />
  );
}
