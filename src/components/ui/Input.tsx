import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const autoId = id ?? `input-${rest.name ?? Math.random().toString(36).slice(2, 8)}`;
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
      <input
        ref={ref}
        id={autoId}
        className={cn(
          "h-11 w-full rounded-full border bg-transparent px-5 text-sm",
          "placeholder:text-muted/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent",
          "transition-colors",
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
});
