import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, id, className, ...rest }, ref) {
    const autoId =
      id ?? `textarea-${rest.name ?? Math.random().toString(36).slice(2, 8)}`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={autoId}
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={autoId}
          className={cn(
            "w-full rounded-2xl border bg-transparent px-5 py-3 text-sm",
            "placeholder:text-muted/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent",
            "transition-colors resize-y",
            error ? "border-accent" : "border-border",
            className,
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error ? `${autoId}-error` : hint ? `${autoId}-hint` : undefined
          }
          {...rest}
        />
        {error ? (
          <p id={`${autoId}-error`} className="text-xs text-accent">
            {error}
          </p>
        ) : hint ? (
          <p id={`${autoId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
