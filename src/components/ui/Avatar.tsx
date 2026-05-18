import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeStyles: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const imageSizes: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "32px",
  md: "40px",
  lg: "64px",
  xl: "96px",
};

/**
 * Avatar circular. Muestra la imagen del perfil si existe, o un fallback
 * con la inicial del nombre completo (o del username) sobre fondo gris.
 */
export function Avatar({
  username,
  fullName,
  avatarUrl,
  size = "md",
  className,
}: AvatarProps) {
  const initial = (fullName?.[0] ?? username?.[0] ?? "?").toUpperCase();

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted-soft font-mono uppercase text-foreground",
        sizeStyles[size],
        className,
      )}
      aria-hidden={!avatarUrl}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Avatar de ${username}`}
          fill
          className="no-touch-save object-cover"
          sizes={imageSizes[size]}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
