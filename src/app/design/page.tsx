import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Sistema de diseño",
};

const colors = [
  { name: "background", token: "bg-background", note: "fondo principal" },
  { name: "foreground", token: "bg-foreground", note: "texto principal" },
  { name: "muted", token: "bg-muted", note: "texto secundario" },
  { name: "muted-soft", token: "bg-muted-soft", note: "fondos suaves" },
  { name: "border", token: "bg-border", note: "líneas y separadores" },
  { name: "accent", token: "bg-accent", note: "CTAs y enlaces" },
  { name: "accent-hover", token: "bg-accent-hover", note: "estado hover del acento" },
];

export default function DesignPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-10">
      <header className="mb-12">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Sistema de diseño
        </p>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
          expo·lab
        </h1>
        <p className="mt-4 text-muted">
          Tokens, tipografía y componentes reutilizables del proyecto.
        </p>
      </header>

      {/* Colores */}
      <Section title="Colores">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colors.map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div
                className={`h-20 w-full rounded-md border border-border ${c.token}`}
              />
              <div>
                <div className="font-mono text-xs">{c.name}</div>
                <div className="text-xs text-muted">{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tipografía */}
      <Section title="Tipografía">
        <div className="space-y-6">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
              Display — Montserrat Black 900
            </p>
            <p className="font-display text-5xl font-black uppercase leading-none tracking-tight">
              Sube tu trabajo.
            </p>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
              Heading — Geist 600
            </p>
            <p className="text-2xl font-semibold">Comunidad de fotógrafos</p>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
              Body — Geist 400
            </p>
            <p className="text-base leading-relaxed">
              expo·lab es un espacio cuidado para mostrar tu trabajo,
              encontrar miradas afines y conversar sobre la imagen.
            </p>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">
              Mono — Geist Mono
            </p>
            <p className="font-mono text-sm">v0.1 · en construcción</p>
          </div>
        </div>
      </Section>

      {/* Botones */}
      <Section title="Botones">
        <div className="space-y-6">
          <Row label="Variantes">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </Row>
          <Row label="Tamaños">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="Estados">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
          </Row>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            hint="No lo compartiremos."
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error="Debe tener al menos 8 caracteres."
          />
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Card básica</h3>
            <p className="text-sm text-muted">
              Contenedor con borde y radio. Para envolver fotos, perfiles, info.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Otra card</h3>
            <p className="text-sm text-muted">
              Más adelante haremos una variante específica para fotos del feed.
            </p>
          </Card>
        </div>
      </Section>

      {/* Radios */}
      <Section title="Radios">
        <div className="flex flex-wrap gap-4">
          {[
            { name: "sm", cls: "rounded-sm" },
            { name: "md", cls: "rounded-md" },
            { name: "lg", cls: "rounded-lg" },
            { name: "xl", cls: "rounded-xl" },
            { name: "full", cls: "rounded-full" },
          ].map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div
                className={`h-16 w-16 border border-border bg-muted-soft ${r.cls}`}
              />
              <span className="font-mono text-xs text-muted">{r.name}</span>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16 border-t border-border pt-8">
      <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="w-24 font-mono text-xs text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
