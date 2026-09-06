/**
 * Loading skeleton for /resume. See the note in app/demos/loading.tsx before
 * adding a loading file to any other segment — a Suspense boundary above a
 * route that calls `notFound()` turns real 404s into soft 404s.
 */
export default function Loading() {
  return (
    <div className="pt-6" aria-busy="true" aria-label="Loading resume">
      <div className="h-3 w-20 rounded bg-surface/[0.10]" />
      <div className="mt-4 h-9 w-64 rounded bg-surface/[0.09]" />
      <div className="mt-8 grid gap-5 md:grid-cols-[1.45fr,1fr]">
        <div className="space-y-5">
          <div className="model-card h-96 animate-pulse" />
          <div className="model-card h-48 animate-pulse" />
        </div>
        <div className="space-y-5">
          <div className="model-card h-64 animate-pulse" />
          <div className="model-card h-40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
