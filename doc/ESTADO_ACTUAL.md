# Estado actual del repositorio

Auditoría realizada para P00 el 7 de noviembre de 2026. Se revisó el repositorio y la configuración local únicamente para identificar nombres y puertos; este documento no contiene valores de conexión ni secretos.

## 1. Proyecto y versiones

Hay un proyecto Next.js con TypeScript estricto. Versiones instaladas:

| Paquete | Versión |
|---|---:|
| Next.js | 15.5.25 |
| React | 19.3.0 |
| TypeScript | 5.9.3 |
| Tailwind CSS | No instalado |

El proyecto utiliza App Router bajo `src/app/`. Los estilos actuales son CSS propio; no hay `tailwind.config.*` ni configuración de Tailwind.

## 2. Scripts de `package.json`

| Script | Comando |
|---|---|
| `dev` | `node scripts/tokenVercel.mjs && next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint .` |
| `format` | `prettier --write "src/**/*.{ts,tsx,css}"` |
| `type-check` | `tsc --noEmit` |
| `db:migrate:supabase` | `node scripts/apply-supabase-migration.mjs` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:coverage` | `vitest run --coverage` |

Todavía no existen `db:migrar`, `db:verificar`, `db:demo` ni `probar:flujo`.

## 3. Estructura relevante

```text
src/
  app/
    account/
    api/
      auth/
      correo/
      data/
      health/
      users/
    login/
    prueba-correo/
    register/
    users/
    auth-form.tsx
    globals.css
    layout.tsx
    page.tsx
  lib/
    auth/                  (sin archivos)
    supabase/
    correo.ts
    json-db.ts
    types.ts
    utils.ts
  test/
components/                (no existe)
data/
  _backups/
  _schema/
  example.json
  note.json
  user.json
supabase/
  migrations/
scripts/
  apply-supabase-migration.mjs
  tokenVercel.mjs
```

No hay `src/components/`, `components/ui/`, `lib/dataService.ts` ni módulo de rendimiento.

## 4. Dependencias relevantes

Versiones instaladas:

| Dependencia | Estado |
|---|---|
| `pg` | Presente, 8.23.1 |
| `@types/pg` | **FALTA** |
| `zod` | Presente, 4.6.2 |
| `@supabase/supabase-js` | Presente, 2.117.2 |
| `@supabase/ssr` | Presente |
| `vitest` | Presente, 3.2.7 |
| `tailwindcss` | **FALTA** |

## 5. Autenticación

Existe login y registro con Supabase Auth:

- Página de login: `src/app/login/page.tsx`; la ruta pública es `/login`.
- Formulario compartido: `src/app/auth-form.tsx`; envía credenciales a `/api/auth/login` o `/api/auth/register`.
- Cliente SSR: `src/lib/supabase/server.ts`.
- Protección: `src/middleware.ts` verifica la sesión con `auth.getUser()` y protege las rutas no públicas. Las páginas sin sesión redirigen a `/login`; las API no autorizadas responden 401.
- Sesión de usuario: las rutas usan el cliente Supabase para `auth.getUser()`. No existe una fachada `obtenerSesion`/`exigirSesion` en `src/lib/auth/`.
- Después del login, el destino por defecto es `/`; permite conservar `next` cuando se envía en la URL. P03 deberá adaptar el destino al módulo.

La aplicación actual también tiene perfiles y roles de administrador/editor/lector para su gestión de usuarios. El módulo de rendimiento debe usar la sesión existente sin importar esos roles a sus reglas de negocio.

## 6. Conexión a Postgres

En `.env.local` están configurados los nombres siguientes. Se comprobó el puerto sin mostrar ni almacenar valores:

| Variable | Puerto | Uso |
|---|---:|---|
| `MEDIFIS_POSTGRES_URL` | 6543 | Pooler; **variable recomendada para `lib/db/conexion.ts`** |
| `MEDIFIS_POSTGRES_PRISMA_URL` | 6543 | También apunta al pooler |
| `MEDIFIS_POSTGRES_URL_NON_POOLING` | 5432 | Conexión directa, no usar para el cliente serverless previsto |

La variable seleccionada para el módulo es `MEDIFIS_POSTGRES_URL`. `.env.local` está excluido por `.gitignore`. No se incluyeron valores, usuarios, hosts, contraseñas ni tokens en este informe.

## 7. Persistencia actual

Las colecciones generales (`note`, `example` y `user`) se guardan en JSON bajo `data/` mediante `src/lib/json-db.ts`; existen backups locales. El CRUD genérico vive en `src/app/api/data/[collection]/route.ts`. En producción las escrituras JSON se deshabilitan.

Supabase Auth y `public.users` se usan para cuentas y perfiles. No hay persistencia de jugadores ni mediciones.

## 8. Migraciones

Existe `supabase/migrations/202610030001_create_users.sql` para perfiles y seguridad, y `scripts/apply-supabase-migration.mjs` para aplicarla. El script aplica ese único archivo: no mantiene una tabla de migraciones, no descubre ni ordena migraciones, y prioriza actualmente la variable non-pooling.

Conclusión: hay una base parcial que debe adaptarse. P01 necesita un ejecutor general idempotente/ordenado y seguro con `MEDIFIS_POSTGRES_URL` (pooler), siguiendo el mecanismo descrito en el plan.

## 9. Estado del dominio

| Elemento | Estado |
|---|---|
| Jugadores | No existe modelo, servicio, endpoint ni tabla |
| Mediciones | No existe modelo, servicio, endpoint ni tabla |
| Clasificaciones y puntaje | No implementados |
| Alertas académicas | No implementadas |
| CRUD actual | Notas y colecciones JSON genéricas; no corresponde al dominio del módulo |
| Tablas de Supabase | Solo migración de `public.users`; no existen tablas `jugadores` ni `mediciones` en las migraciones |

## 10. Estilos

Tailwind CSS no está instalado. `src/app/globals.css` contiene CSS tradicional, variables CSS (`--ink`, `--muted`, `--paper`, `--line`, `--lime`, `--deep`, `--coral`), reglas responsive y fuentes Manrope/DM Mono cargadas desde Google Fonts. No hay `tailwind.config.*` ni tokens `@theme`.

## 11. Pruebas

El framework es Vitest 3.2.7, configurado en `vitest.config.ts` para pruebas bajo `src/**/*.{test,spec}.{ts,tsx}`. Se identificaron cuatro archivos:

- `src/lib/supabase/config.test.ts`
- `src/app/api/health/route.test.ts`
- `src/app/api/auth/password/route.test.ts`
- `src/app/api/correo/prueba/route.test.ts`

Verificación realizada: **4 archivos y 10 pruebas pasaron** con `npm.cmd test`.

## 12. Conflictos comprobados

- No existe `src/app/rendimiento/` ni `src/app/api/rendimiento/`.
- No existe `src/lib/dataService.ts`, `components/ui/` ni `src/components/`.
- `src/app/page.tsx` es la pantalla de notas del equipo; no debe asumirse que sea una página vacía.
- No existen tablas ni migraciones de `jugadores` o `mediciones`.
- Sí hay una migración de perfiles `public.users`; debe conservarse.

## 13. Decisiones para los siguientes prompts

| Decisión | Resultado |
|---|---|
| Proyecto base | Usar el Next.js + TypeScript existente; no recrear el proyecto |
| Ruta de login | Usar `/login` existente; adaptar el destino posterior al login en P03 |
| Protección | `src/middleware.ts` (Next.js 15; no `proxy.ts`) |
| Migraciones | Adaptar el script existente creando un ejecutor general `scripts/migrar.mjs` y `db:migrar`; conservar la migración de usuarios |
| Variable Postgres | `MEDIFIS_POSTGRES_URL` (pooler, puerto 6543) |
| M1 | `202611070001_create_jugadores_mediciones.sql` |
| M2 | `202611070002_create_v_jugadores_security.sql` |
| Alias de imports | `@/` para `src/*`; `@data/` para `data/*` |
| Ubicación de App Router | `src/app/` |
| Tailwind | No está instalado; P06 debe conciliarlo con los estilos CSS existentes antes de declarar tokens |
| Adaptador de sesión | Crear `src/lib/auth/sesion.ts` sobre Supabase Auth; no reimplementar credenciales |

## 14. Compilación de base

`npm.cmd run build`: **correcto**. Next.js compiló, validó tipos, generó 17 páginas estáticas y finalizó el trazado de producción. Solo aparecieron advertencias no bloqueantes de webpack por serialización de cadenas grandes. En este entorno PowerShell bloquea el shim `npm.ps1`; por eso se ejecutó el comando equivalente `npm.cmd run build`.

`npm.cmd test`: **correcto**, 4 archivos y 10 pruebas aprobados.
