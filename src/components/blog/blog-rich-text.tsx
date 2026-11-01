/**
 * Renders fixture HTML that was already allowlisted at import time
 * (`strong` | `em` | `a` | `br` only). Not a general HTML sanitizer.
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
