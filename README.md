# expo-lab

Una comunidad web para fotógrafos. Inspirado en los inicios de Instagram, VSCO y Flickr.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (Auth + PostgreSQL + Storage)
- Desplegado en Vercel

## Desarrollo local

Requisitos: Node.js 20+ y una cuenta de Supabase con el proyecto creado.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

(Se completarán en la Etapa 4.)

## Estructura

```
src/
├── app/          ← rutas y páginas (App Router)
├── components/   ← componentes reutilizables
└── lib/          ← clientes Supabase y utilidades
```

## Scripts

- `npm run dev` — servidor local en `localhost:3000`.
- `npm run build` — build de producción.
- `npm run lint` — revisar calidad de código.
