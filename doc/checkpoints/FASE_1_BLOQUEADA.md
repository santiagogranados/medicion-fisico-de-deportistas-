# Fase 1 · Bloqueada por conexión a Supabase

## Trabajo preparado

- M1: `supabase/migrations/202611070001_create_jugadores_mediciones.sql`.
- M2: `supabase/migrations/202611070002_create_v_jugadores_security.sql`.
- Runner transaccional y ordenado: `scripts/migrar.mjs`.
- Verificación de esquema, RLS e integridad con rollback: `scripts/verificar-bd.mjs`.
- Cliente de scripts limitado a `MEDIFIS_POSTGRES_URL` en el pooler 6543.
- Se añadieron `db:migrar`, `db:verificar` y `@types/pg`.

## Verificaciones locales

- `node --check` para `scripts/postgres.mjs`, `scripts/migrar.mjs` y `scripts/verificar-bd.mjs`: correcto.
- `npm.cmd test`: 4 archivos, 10 pruebas aprobadas.
- `npm.cmd run build`: correcto.

## Salida de base de datos

`npm.cmd run db:migrar`:

```text
No se pudo completar conexión; código de error: TIMEOUT.
```

`npm.cmd run db:verificar`:

```text
No se pudo completar la verificación; código de error: TIMEOUT.
Total de fallas: 1
```

La conexión TCP al puerto 6543 respondió, pero el protocolo PostgreSQL expiró o fue reiniciado durante la negociación. No se confirmó la aplicación de M1/M2; como la operación inicial de creación de `public._migrations` pudo alcanzar al servidor antes de perder la respuesta, su existencia también queda pendiente de verificación. No se registraron credenciales, URL, host ni otros valores sensibles.

## Para reanudar

Verificar en Supabase que el proyecto esté activo y que el pooler acepte conexiones desde el entorno actual. Después ejecutar `npm.cmd run db:migrar` y `npm.cmd run db:verificar`. P01 solo se puede marcar completado cuando la verificación termina sin fallas. P02 permanece pendiente hasta entonces.
