# Medifis

Panel fullstack para registrar observaciones y mediciones físicas de deportistas. La primera entrega
implementa la base vertical del plan: Next.js + TypeScript estricto, persistencia JSON local, esquemas
Zod, API de salud, CRUD genérico para colecciones y una interfaz responsive para notas del equipo.

## Desarrollo

```bash
npm install
copy .env.example .env.local
npm run dev
```

Comandos de calidad:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

La aplicación se abre en `http://localhost:3000`. La salud está disponible en `/api/health` y el CRUD
de notas en `/api/data/note`.

## Acceso y Supabase

El login usa Supabase Auth. Los perfiles se crean automáticamente en `public.users` al registrar una
cuenta; las contraseñas permanecen en `auth.users`, gestionadas por Supabase. El primer registro
obtiene el rol `admin` de forma transaccional; las cuentas siguientes empiezan como `viewer`.

Los administradores tienen el menú **Usuarios** para crear cuentas y editar nombre, correo, rol y
contraseña. Las operaciones administrativas usan `MEDIFIS_SUPABASE_SECRET_KEY` o
`MEDIFIS_SUPABASE_SERVICE_ROLE_KEY`, exclusivamente en el servidor. Nunca expongas esas variables con
el prefijo `NEXT_PUBLIC_`.

Configura la URL y la clave publicable usando `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, o las variables equivalentes generadas por Vercel. Para aplicar
la tabla al proyecto enlazado en `.env.local`, ejecuta `npm run db:migrate:supabase`; requiere
`MEDIFIS_POSTGRES_URL_NON_POOLING` o `MEDIFIS_POSTGRES_URL`. Si Node no confía en el certificado TLS del
proyecto, descarga su certificado CA desde la configuración de base de datos de Supabase y define
`SUPABASE_DB_CA_CERT` con su ruta local. La verificación TLS permanece activa. El comando no imprime
la URL ni la clave.

La migración aplica RLS: cada usuario solo puede leer su perfil y actualizar su nombre. El registro
público no permite autoconcederse privilegios; solo el primer registro y los administradores pueden
asignar el rol `admin`.

## Arquitectura

- `src/app`: App Router, página principal y endpoints.
- `src/lib/json-db.ts`: lectura, escritura atómica, backups y serialización de escrituras.
- `data`: colecciones JSON y esquemas Zod.
- `doc`: plan completo de evolución por fases.

La persistencia sobre archivos es adecuada para desarrollo local. Antes de habilitar escrituras en
producción debe añadirse el adapter persistente previsto en la Fase 4.