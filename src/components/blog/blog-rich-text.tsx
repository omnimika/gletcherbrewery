/**
 * Renders fixture HTML that was already allowlisted at import time
 * (inline: `strong` | `em` | `a` | `br`; list blocks may wrap `ul`/`ol`/`li`).
 * Not a general HTML sanitizer.
 */
export function BlogRichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
