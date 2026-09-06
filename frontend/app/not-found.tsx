import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center pt-10">
      <div className="model-card max-w-lg p-8 text-center">
        <p className="layer-label">$ exit code 404</p>
        <h1 className="mt-2 font-display text-3xl text-ink-50">Page not found</h1>
        <p className="mt-2 text-sm text-ink-200">
          The route you followed doesn't exist (or moved). Head back home or try
          the projects index.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/" className="btn-primary">home</Link>
          <Link href="/projects" className="btn-ghost">/projects</Link>
        </div>
      </div>
    </div>
  );
}
