"use client";

import { type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

// Drop-in replacement for <textarea>. Adds max-h-[60vh], overflow-y-auto,
// and resize-y so textareas never grow unboundedly — content scrolls within
// the box and users can drag taller if needed.
export function AutoTextarea({ className = "", ...rest }: Props) {
  return (
    <textarea
      className={`max-h-[60vh] overflow-y-auto resize-y ${className}`}
      {...rest}
    />
  );
}
