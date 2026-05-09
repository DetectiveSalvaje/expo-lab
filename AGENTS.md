<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# expo-lab

Comunidad web para fotógrafos. Inspirado en los inicios de Instagram, VSCO y Flickr. Foco en imagen cuidada, perfiles propios y descubrimiento de trabajo.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Backend / Auth / DB / Storage:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Hosting:** Vercel
- **Idioma de la interfaz:** Español

## Convenciones

- Todo el código fuente vive en `src/`.
- Páginas y rutas en `src/app/` (App Router de Next.js).
- Componentes reutilizables en `src/components/` (se irán creando).
- Lógica de Supabase y helpers en `src/lib/` (se irá creando).
- Estilos: solo Tailwind. Nada de CSS modules.
- Idioma del UI y los textos visibles: **español**. Nombres de variables y comentarios técnicos: inglés está OK.
- Imágenes: nunca usar `<img>` directo, siempre `<Image>` de `next/image`.
