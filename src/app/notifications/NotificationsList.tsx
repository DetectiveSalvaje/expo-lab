"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { relativeTime } from "@/lib/relative-time";
import {
  markAllAsRead,
  type NotificationItem,
} from "@/app/actions/notifications";

type Props = {
  items: NotificationItem[];
};

export function NotificationsList({ items }: Props) {
  // Auto-mark as read al entrar
  useEffect(() => {
    if (items.some((n) => !n.read_at)) {
      markAllAsRead();
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Sin notificaciones
        </p>
        <p className="mt-3 text-sm text-muted">
          Cuando alguien interactúe con tu trabajo, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((n) => (
        <li key={n.id}>
          <NotificationItemRow item={n} />
        </li>
      ))}
    </ul>
  );
}

function NotificationItemRow({ item }: { item: NotificationItem }) {
  const href = buildHref(item);
  const text = buildText(item);
  const time = relativeTime(item.created_at);

  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted-soft"
    >
      <Avatar
        username={item.actor.username}
        fullName={item.actor.full_name}
        avatarUrl={item.actor.avatar_url}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium">
            {item.actor.full_name ?? item.actor.username}
          </span>{" "}
          <span className="text-muted">{text}</span>
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted">
          {time}
        </p>
      </div>
      {item.photo_cover_url && (
        <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.photo_cover_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </span>
      )}
    </Link>
  );
}

function buildText(n: NotificationItem): string {
  switch (n.type) {
    case "like":
      return "le dio me gusta a tu foto";
    case "comment":
      return n.comment_body
        ? `comentó: "${truncate(n.comment_body, 60)}"`
        : "comentó tu foto";
    case "follow":
      return "te empezó a seguir";
  }
}

function buildHref(n: NotificationItem): string {
  if (n.type === "follow") return `/u/${n.actor.username}`;
  if (n.photo_id) return `/p/${n.photo_id}`;
  return `/u/${n.actor.username}`;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}
