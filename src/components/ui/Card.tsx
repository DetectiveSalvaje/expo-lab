import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
};

export function Card({ as: Tag = "div", className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-border bg-background overflow-hidden",
        className,
      )}
      {...rest}
    />
  );
}
