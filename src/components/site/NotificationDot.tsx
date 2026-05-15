"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialUnread: boolean;
};

/**
 * Pulso blanco que late en la esquina del icono de notificaciones
 * cuando hay al menos una notif sin leer. Conectado a Supabase Realtime
 * para aparecer instantáneamente.
 */
export function NotificationDot({ userId, initialUnread }: Props) {
  const [hasUnread, setHasUnread] = useState(initialUnread);
  const pathname = usePathname();

  // Si estamos en /notifications, no mostramos el dot (auto-mark se encarga)
  const visible = hasUnread && pathname !== "/notifications";

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
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
          setHasUnread(true);
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
          // Tras un UPDATE (típicamente marcar como leído), re-check
          const { count } = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .is("read_at", null);
          setHasUnread((count ?? 0) > 0);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
