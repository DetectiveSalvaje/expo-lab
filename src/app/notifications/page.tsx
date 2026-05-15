import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/app/actions/notifications";
import { NotificationsList } from "./NotificationsList";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const items = await getNotifications();

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Actividad
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Notificaciones
          </h1>
        </header>

        <NotificationsList items={items} />
      </section>
    </SiteShell>
  );
}
