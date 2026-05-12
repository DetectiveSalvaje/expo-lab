import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Términos de uso",
  description:
    "Las reglas de la comunidad expo·lab y cómo manejamos el contenido.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Términos de uso
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
            Última actualización: mayo de 2026
          </p>
        </header>

        <article className="space-y-10 text-sm leading-relaxed text-foreground/90">
          <Section title="Al usar expo·lab aceptás estos términos">
            <p>
              Al registrarte y usar la plataforma, aceptás cumplir con lo que
              está escrito acá. Si no estás de acuerdo, no uses el servicio.
            </p>
          </Section>

          <Section title="Tu cuenta">
            <p>
              Sos responsable de mantener tu contraseña segura. No compartas
              tu cuenta con otras personas. Si sospechás que alguien accedió
              sin permiso, cambia tu contraseña inmediatamente.
            </p>
            <p className="mt-3">
              No te hagas pasar por otra persona. No crees cuentas múltiples
              con intención de manipular el sistema (spam, likes inflados,
              etc).
            </p>
          </Section>

          <Section title="Tus fotos son tuyas">
            <p>
              <strong>El copyright y los derechos sobre tus fotografías
              son y siguen siendo tuyos.</strong> Al subir contenido a expo·lab,
              nos das una licencia <strong>no exclusiva, revocable y mundial</strong>{" "}
              para mostrar tu trabajo dentro de la plataforma — en tu perfil,
              en el feed comunitario y al optimizar las imágenes para que
              carguen rápido. Nada más.
            </p>
            <p className="mt-3">
              <strong>No vendemos tus fotos, no las usamos para
              publicidad, no las entrenamos contra modelos de IA.</strong>
            </p>
            <p className="mt-3">
              Cuando borrás una foto, la quitamos de la plataforma y del
              almacenamiento.
            </p>
          </Section>

          <Section title="Solo subí lo que es tuyo">
            <p>
              No subas fotografías que no hayas tomado vos, salvo que tengas
              permiso explícito del autor o que la imagen esté en dominio
              público / con licencia compatible (Creative Commons, etc).
            </p>
            <p className="mt-3">
              Si una persona aparece reconocible en una foto, asegúrate de
              tener su consentimiento — sobre todo si se trata de retratos
              íntimos, menores de edad o contextos privados.
            </p>
          </Section>

          <Section title="Qué no está permitido">
            <p>Tampoco subas o publiques:</p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>Contenido ilegal, violento, sexualmente explícito, o que sexualice menores de edad.</li>
              <li>Imágenes de odio, acoso, amenazas o discriminación.</li>
              <li>Spam, contenido engañoso o auto-promoción agresiva.</li>
              <li>Material protegido por copyright de terceros.</li>
              <li>Cualquier cosa que viole leyes aplicables en tu país.</li>
            </ul>
            <p className="mt-3">
              Cuentas que violen estas normas pueden ser suspendidas o
              eliminadas, sin previo aviso si la infracción es grave.
            </p>
          </Section>

          <Section title="Comportamiento en la comunidad">
            <p>
              Comentá con respeto. La crítica fotográfica es bienvenida, el
              hostigamiento no. No exigimos un tono particular — solo no seas
              cruel con otros usuarios.
            </p>
          </Section>

          <Section title="Disponibilidad del servicio">
            <p>
              expo·lab se ofrece "tal cual". Hacemos lo mejor que podemos para
              mantenerlo disponible, pero <strong>no garantizamos uptime perfecto</strong>{" "}
              ni que no haya bugs. Esta es una plataforma joven en
              construcción activa.
            </p>
            <p className="mt-3">
              No somos responsables por pérdida de datos provocada por fallas
              técnicas. Te recomendamos mantener copias propias de tus
              fotografías originales.
            </p>
          </Section>

          <Section title="Cancelación">
            <p>
              Podés borrar tu cuenta en cualquier momento. Al hacerlo,
              eliminamos tu perfil, fotos, comentarios y datos asociados de
              forma permanente.
            </p>
            <p className="mt-3">
              Podemos suspender o cerrar una cuenta si viola estos términos
              de forma reiterada.
            </p>
          </Section>

          <Section title="Cambios">
            <p>
              Podemos actualizar estos términos. Si hay cambios sustanciales,
              te avisaremos por email o desde la propia app antes de que
              entren en vigor.
            </p>
          </Section>

          <Section title="Contacto">
            <p>
              Para cualquier consulta legal, escribinos a{" "}
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
