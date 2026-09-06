"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Renders a muted, looping <video> element as an ambient backdrop. If the
 * source is missing or fails to load, the component cleanly hides itself so
 * the underlying layer (e.g. <MatrixRain />, <Hero3DScene />) shows through.
 *
 * Drop your reel at `frontend/public/hero.mp4` (or pass a custom `src`) and it
 * will autoplay behind the hero.
 */
export function VideoBackdrop({
  src = "/hero.mp4",
  poster,
  className,
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onCanPlay = () => setReady(true);
    const onError = () => setFailed(true);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, [src]);

  if (failed) return null;

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
