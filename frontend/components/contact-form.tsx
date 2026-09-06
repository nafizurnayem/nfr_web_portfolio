"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { submitContact, type ContactPayload } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Please add a subject.").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters so I know what you need.")
    .max(5000),
  website: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

const MESSAGE_MAX = 5000;

/**
 * Bridges zod into react-hook-form without pulling in `@hookform/resolvers`.
 * Without a resolver, RHF only knows about `required` and the schema's messages
 * never reach the individual fields — which is what made every invalid field
 * report the same generic error before.
 */
const zodResolver: Resolver<FormValues> = async (values) => {
  const result = schema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = { type: issue.code, message: issue.message };
    }
  }
  return { values: {}, errors: errors as never };
};

export function ContactForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver,
    mode: "onBlur",
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const messageLength = watch("message")?.length ?? 0;

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSuccess(false);
    const payload: ContactPayload = values;
    const response = await submitContact(payload);
    if (!response.ok) {
      setServerError(response.error || "Could not send the message. Please try again.");
      return;
    }
    setSuccess(true);
    reset();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="model-card p-6"
      autoComplete="on"
    >
      <p className="layer-label">
        <span className="text-accent">::</span> send a message
      </p>

      {/* Honeypot. Hidden from users and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Leave this field blank
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          error={errors.name?.message}
          input={
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="input font-mono"
              placeholder="Ada Lovelace"
              maxLength={120}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
            />
          }
        />
        <Field
          id="email"
          label="Email"
          error={errors.email?.message}
          input={
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input font-mono"
              placeholder="you@company.com"
              maxLength={255}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          }
        />
      </div>

      <div className="mt-4">
        <Field
          id="subject"
          label="Subject"
          error={errors.subject?.message}
          input={
            <input
              id="subject"
              type="text"
              className="input font-mono"
              placeholder="Computer vision project — need a model trained"
              maxLength={200}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              {...register("subject")}
            />
          }
        />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <label className="label" htmlFor="message">
            Message
          </label>
          <span
            className={`tabular font-mono text-[11px] ${
              messageLength > MESSAGE_MAX * 0.9 ? "text-accent-amber" : "text-ink-300"
            }`}
          >
            {messageLength}/{MESSAGE_MAX}
          </span>
        </div>
        <textarea
          id="message"
          rows={6}
          className="input font-mono"
          placeholder="Tell me what you're building, roughly when you need it, and what success looks like."
          maxLength={MESSAGE_MAX}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 font-mono text-xs text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-ink-300">
          Validated and rate-limited server-side.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          data-cursor-label="send"
          className="btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950"
            />
          )}
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
      </div>

      {/* Submission outcome. `role="status"` announces it to screen readers
          without stealing focus. */}
      <div role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          {serverError && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-md border border-red-500/30 bg-red-500/[0.08] px-3 py-2 font-mono text-xs text-red-300"
            >
              {serverError}
            </motion.p>
          )}
          {success && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-md border border-accent-green/30 bg-accent-green/[0.08] px-3 py-2 font-mono text-xs text-accent-green"
            >
              Message sent — I&rsquo;ll get back to you shortly.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  input,
}: {
  id: string;
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {input}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-mono text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
