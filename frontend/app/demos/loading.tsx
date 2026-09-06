/**
 * Loading skeleton for /demos.
 *
 * IMPORTANT: do not add a `loading.tsx` to the app root, or to any segment that
 * contains a route calling `notFound()` (currently `/projects/[slug]`).
 * A `loading.tsx` opens a Suspense boundary, which starts streaming the
 * response — once streaming begins the 200 status is already committed, so a
 * later `notFound()` renders the 404 page with a 200 status. That soft-404 tells
 * search engines the missing page is real content. This file is safe because
 * /demos has no dynamic children and never calls notFound().
 */
export default function Loading() {
  return (
    <div className="pt-6" aria-busy="true" aria-label="Loading demos">
      <div className="h-3 w-24 rounded bg-surface/[0.10]" />
      <div className="mt-4 h-9 w-72 rounded bg-surface/[0.09]" />
      <div className="mt-3 h-4 w-full max-w-2xl rounded bg-surface/[0.06]" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="model-card h-80 animate-pulse" />
        <div className="model-card h-80 animate-pulse" />
      </div>
    </div>
  );
}
