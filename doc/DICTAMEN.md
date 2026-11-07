# Dictamen de conciliación

Dictamen P00 del 7 de noviembre de 2026, basado en el repositorio inspeccionado y en [`PLAN_RENDIMIENTO.md`](./PLAN_RENDIMIENTO.md). El proyecto actual se llama Medifis y ya tiene una aplicación Next.js funcional para autenticación, usuarios y notas. El dominio de rendimiento físico descrito en el plan todavía no está implementado.

## Infraestructura

### Proyecto Next.js + TypeScript
- Estado: EXISTE Y SIRVE
- Qué hacer: USAR
- Detalle: Next.js 15.5.25, React 19.3.0 y TypeScript 5.9.3. `npm.cmd run build` finaliza correctamente. El App Router está en `src/app/`.

### Tailwind CSS
- Estado: NO EXISTE
- Qué hacer: CREAR o adaptar explícitamente en P06
- Detalle: no está instalado ni configurado. Hay estilos CSS propios y variables visuales en `src/app/globals.css`; preservar la interfaz existente y decidir cómo cumplir el sistema visual del plan sin asumir que Tailwind ya está presente.

### Supabase Auth y conexión a Postgres
- Estado: EXISTE PARCIAL
- Qué hacer: ADAPTAR
- Detalle: Supabase Auth ya se usa para login/registro y `public.users`. `.env.local` contiene `MEDIFIS_POSTGRES_URL` (pooler, puerto 6543), junto con `MEDIFIS_POSTGRES_PRISMA_URL` (6543) y `MEDIFIS_POSTGRES_URL_NON_POOLING` (5432). Para el módulo con `pg`, usar `MEDIFIS_POSTGRES_URL`. No se verificó aquí la conectividad remota.

### Login y sesión
- Estado: EXISTE Y SIRVE
- Qué hacer: ADAPTAR
- Detalle: `/login`, Supabase Auth y `src/middleware.ts` están implementados. P03 debe exponer `obtenerSesion`/`exigirSesion` y orientar el flujo del módulo a `/rendimiento`, sin reescribir ni reemplazar el login existente.

### Migraciones
- Estado: EXISTE PARCIAL
- Qué hacer: ADAPTAR
- Detalle: hay una migración de perfiles de usuarios y un script dedicado a aplicarla, pero no un runner de migraciones versionadas. P01 debe crear `scripts/migrar.mjs`/`db:migrar`, conservar la migración existente y usar la conexión pooler seleccionada.

## Funcionalidades del módulo mínimo

### F1 · Registrar jugador
- Estado: NO EXISTE
- Qué hacer: CREAR
- Detalle: implementar tablas, validación, servicio, API y formulario en P01, P02, P04, P05 y P07.

### F2 · Calcular velocidad promedio
- Estado: NO EXISTE
- Qué hacer: CREAR
- Detalle: la regla pura y su prueba van en P02; el caso de uso y la API/interfaz en P04, P05 y P07.

### F3 · Clasificar y puntuar
- Estado: NO EXISTE
- Qué hacer: CREAR
- Detalle: implementar reglas puras y límites exactos en P02; calcular al leer en P04/P08.

### F4 · Consultar jugador
- Estado: NO EXISTE
- Qué hacer: CREAR
- Detalle: consultar por código o nombre desde P04/P05 y mostrar la ficha en P08.

### F5 · Alertas
- Estado: NO EXISTE
- Qué hacer: CREAR
- Detalle: derivar alertas con las reglas compartidas y mostrar el aviso académico/no médico en P04/P08.

## Resumen

| Pieza | Estado | Acción | Prompt |
|---|---|---|---|
| Next.js + TypeScript | EXISTE Y SIRVE | USAR | P00 en adelante |
| Tailwind CSS | NO EXISTE | CREAR/adaptar | P06 |
| Supabase Auth + conexión Postgres | EXISTE PARCIAL | ADAPTAR | P03 |
| Login | EXISTE Y SIRVE | ADAPTAR, conservar | P03 |
| Migraciones | EXISTE PARCIAL | ADAPTAR | P01 |
| F1 Registrar jugador | NO EXISTE | CREAR | P01, P02, P04, P05, P07 |
| F2 Velocidad promedio | NO EXISTE | CREAR | P02, P04, P05, P07 |
| F3 Clasificación y puntaje | NO EXISTE | CREAR | P02, P04, P08 |
| F4 Consultar jugador | NO EXISTE | CREAR | P04, P05, P08 |
| F5 Alertas | NO EXISTE | CREAR | P02, P04, P08 |

## Qué necesita conseguir o confirmar la estudiante

1. Confirmar que el proyecto Supabase esperado es el que corresponde a las variables locales y que está accesible desde el entorno donde se ejecutará P01. La presencia de variables no prueba conectividad.
2. Conservar configurada la variable pooler `MEDIFIS_POSTGRES_URL` (puerto 6543) para el cliente `pg`; no usar `MEDIFIS_POSTGRES_URL_NON_POOLING` para ese cliente serverless.
3. Confirmar que puede autorizar la aplicación de migraciones al proyecto Supabase antes de ejecutar P01.

No se muestran valores de variables, claves ni credenciales en este dictamen.
