"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialUnread: boolean;
};

/**
 * Pulso blanco en la esquina del icono de notificaciones cuando hay
 * algo sin leer. Realtime via Supabase para aparecer instantáneamente.
 *
 * Defensivo: si la tabla no existe o realtime no está habilitado,
 * el componente simplemente no muestra nada (sin romper la página).
 */
export function NotificationDot({ userId, initialUnread }: Props) {
  const [hasUnread, setHasUnread] = useState(initialUnread);
  const pathname = usePathname();

  const visible = hasUnread && pathname !== "/notifications";

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel(`user-notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            if (!cancelled) setHasUnread(true);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          async () => {
            if (cancelled) return;
            try {
              const { count } = await supabase
                .from("notifications")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .is("read_at", null);
              if (!cancelled) setHasUnread((count ?? 0) > 0);
            } catch {
              // silent
            }
          },
        )
        .subscribe();
    } catch (err) {
      console.error("[NotificationDot] subscribe failed:", err);
    }

    return () => {
      cancelled = true;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // silent
        }
      }
    };
  }, [userId]);

  if (!visible) return null;

  return (
    <span
      aria-label="Tienes notificaciones sin leer"
      className="pointer-events-none absolute right-1 top-1 flex h-2.5 w-2.5"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-foreground" />
    </span>
  );
}
