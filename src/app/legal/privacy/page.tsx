import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo expo·lab recoge, usa y protege la información de sus usuarios.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Política de privacidad
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
            Última actualización: mayo de 2026
          </p>
        </header>

        <article className="space-y-10 text-sm leading-relaxed text-foreground/90">
          <Section title="Qué datos guardamos">
            <p>
              Para que expo·lab funcione, recogemos solo lo necesario:
            </p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>
                Tu <strong>correo electrónico</strong> y una contraseña cifrada
                — necesarios para crear tu cuenta y autenticarte.
              </li>
              <li>
                Tu <strong>nombre de usuario</strong> (público) y, si lo
                completás, tu nombre, biografía, web y foto de perfil.
              </li>
              <li>
                Las <strong>fotografías</strong> que publiques con su título,
                descripción y metadatos técnicos (cámara, lente, etc., si los
                proveés).
              </li>
              <li>
                Tu <strong>actividad</strong>: likes, comentarios, guardados y
                seguidores. Esto permite que la comunidad funcione.
              </li>
              <li>
                Una <strong>cookie de sesión</strong> para mantenerte logueado.
                No usamos cookies de rastreo ni de publicidad.
              </li>
            </ul>
          </Section>

          <Section title="Quién ve qué">
            <p>
              <strong>Públicos para cualquiera:</strong> tu nombre de usuario,
              foto de perfil, biografía, web, fotografías que publiques, likes
              dados, comentarios, y a quién seguís.
            </p>
            <p className="mt-3">
              <strong>Privados para vos:</strong> tu correo electrónico, tu
              contraseña (siempre cifrada), y las fotos que guardes en
              "Guardados". Nadie más los ve.
            </p>
          </Section>

          <Section title="Con quién compartimos">
            <p>
              Para operar la plataforma usamos dos servicios externos:
            </p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>
                <strong>Supabase</strong> — donde vive la base de datos y se
                almacenan las imágenes. Cumple con estándares de seguridad
                internacionales. Más información en{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  supabase.com/privacy
                </a>
                .
              </li>
              <li>
                <strong>Vercel</strong> — donde está hosteada la web. Más
                información en{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  vercel.com/legal/privacy-policy
                </a>
                .
              </li>
            </ul>
            <p className="mt-3">
              <strong>No vendemos ni compartimos tus datos con terceros
              para publicidad o marketing.</strong>
            </p>
          </Section>

          <Section title="Tus derechos">
            <p>Podés en cualquier momento:</p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>Editar tu perfil (nombre, bio, web, foto).</li>
              <li>Borrar fotografías que hayas publicado.</li>
              <li>
                Solicitar la <strong>eliminación de tu cuenta</strong> y todos
                los datos asociados — escribinos al contacto de abajo (próximamente
                vamos a añadir el botón directo en configuración).
              </li>
            </ul>
          </Section>

          <Section title="Menores de edad">
            <p>
              expo·lab no está dirigido a menores de 13 años. Si descubrimos
              que un menor de 13 creó una cuenta, eliminaremos sus datos.
            </p>
          </Section>

          <Section title="Cambios en esta política">
            <p>
              Podemos actualizar este documento. Si hay cambios importantes,
              te avisaremos por email o desde la propia app.
            </p>
          </Section>

          <Section title="Contacto">
            <p>
              Para cualquier consulta sobre privacidad, escribinos a{" "}
              <a
                href="mailto:hola@expo-lab.app"
                className="text-accent underline-offset-4 hover:underline"
              >
                hola@expo-lab.app
              </a>
              .
            </p>
          </Section>
        </article>
      </main>

      <SiteFooter />
    </>
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
    <section>
      <h2 className="mb-3 text-base font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
