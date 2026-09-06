"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitPlantDiseaseDemo, type DemoPrediction } from "@/lib/api";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 4 * 1024 * 1024;

export function PlantDiseaseDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  // Object URLs hold the blob in memory until explicitly revoked, so release
  // the previous preview whenever it is replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile(f: File | null) {
    setError(null);
    setResult(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!f) {
      setFile(null);
      return;
    }
    if (!ACCEPT.split(",").includes(f.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Image is too large (max 4 MB).");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    const res = await submitPlantDiseaseDemo(file);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Something went wrong.");
      return;
    }
    setResult(res.data || null);
  }

  return (
    <div className="model-card relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="layer-label">
            <span className="text-accent">::</span> demo · plant-disease
          </p>
          <h2 className="mt-1.5 font-display text-xl text-ink-50">Leaf disease classifier</h2>
        </div>
        <span className="pill-accent">live</span>
      </div>

      <p className="mt-2 text-sm text-ink-200">
        Upload a leaf photo. The placeholder model (deterministic from the image
        hash) returns a plausible label, confidence, and top-3 alternates so you
        can validate the full pipeline end-to-end.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0] || null;
            pickFile(f);
          }}
          className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
            drag ? "border-accent/60 bg-accent/[0.05]" : "border-line/10 bg-surface/[0.04]"
          }`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            // role="button" promises keyboard activation; deliver it.
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Choose a leaf image to classify. Accepts JPEG, PNG or WebP up to 4 megabytes."
          data-cursor-label="upload"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected leaf preview"
              className="max-h-44 rounded-lg border border-line/10"
            />
          ) : (
            <>
              <p className="font-mono text-sm text-ink-100">
                <span className="text-accent">$</span> drop image, or click to browse
              </p>
              <p className="mt-1 font-mono text-xs text-ink-300">
                jpeg · png · webp · max 4 MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!file || loading}
            data-cursor-label="run →"
            className="btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "running inference…" : "run model"}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => pickFile(null)}
              className="btn-ghost cursor-pointer"
            >
              clear
            </button>
          )}
          {error && (
            <span role="alert" className="font-mono text-xs text-red-400">
              {error}
            </span>
          )}
        </div>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
            className="mt-5 rounded-xl border border-line/10 bg-ink-900/60 p-4"
          >
            <p className="layer-label">
              <span className="text-accent">::</span> prediction
            </p>
            <p className="mt-1 font-mono text-lg text-accent-soft">
              {result.label}{" "}
              <span className="text-ink-200">·</span>{" "}
              <span className="text-ink-100">{(result.confidence * 100).toFixed(1)}%</span>
            </p>
            {result.top_k.length > 0 && (
              <ul className="mt-3 space-y-1">
                {result.top_k.map((k) => (
                  <li key={k.label} className="flex items-center gap-3">
                    <span className="w-44 truncate font-mono text-xs text-ink-100">{k.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface/[0.09]">
                      <div
                        className="h-full bg-gradient-to-r from-accent-glow to-accent"
                        style={{ width: `${Math.round(k.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-ink-300">
                      {Math.round(k.confidence * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 font-mono text-xs text-ink-300">
              model: {result.model}
              {result.notes ? ` · ${result.notes}` : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
