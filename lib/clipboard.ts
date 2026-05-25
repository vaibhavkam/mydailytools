// Safari requires clipboard calls to originate from a direct user gesture.
// Calling writeText inside a .then() or async chain can throw NotAllowedError
// silently. This helper swallows the error gracefully — the worst case is the
// copy just doesn't happen, which is already the user's mental model for a
// "Copy" button that does nothing visible.
export function safeCopy(text: string): void {
  navigator.clipboard.writeText(text).catch(() => {});
}
