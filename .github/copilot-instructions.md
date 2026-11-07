# Rendimiento Físico · Instrucciones para Copilot

## Documentos rectores

- Plan técnico: `doc/PLAN_RENDIMIENTO.md`. Si una instrucción contradice el plan, prevalece el plan.
- Estado real del repositorio: `doc/ESTADO_ACTUAL.md`.
- Dictamen de conciliación: `doc/DICTAMEN.md`. Antes de crear algo, revisa si dice USAR (ya existe).
- Avance: `doc/ESTADO_EJECUCION.md`.

## Stack y decisiones verificadas

- Next.js App Router + TypeScript, bajo `src/app/`; imports de `src/*` con `@/`.
- Supabase Postgres con `pg` y `MEDIFIS_POSTGRES_URL` (pooler, puerto 6543). No imprimir la URL ni claves. No usar la conexión non-pooling para el cliente serverless.
- Validación con Zod. Pruebas con Vitest.
- Autenticación existente: Supabase Auth en `/login`; reutilizarla mediante `src/lib/auth/sesion.ts` y conservar `src/middleware.ts` (Next.js 15). No recrear el login ni agregar roles al módulo de rendimiento.
- Tailwind CSS no está instalado al iniciar este plan. Revisar el dictamen y conciliar los tokens del diseño en P06 sin borrar ni romper los estilos existentes.
- Migración de usuarios existente: conservarla. Las migraciones nuevas y sus scripts deben usar la variable pooler elegida.

## Proyecto académico

Los datos son simulados; las clasificaciones y alertas son indicadores del proyecto, no diagnósticos médicos. Los textos de interfaz deben aclararlo.

## Reglas del dominio

- Clasificaciones por umbral en `src/lib/reglas/clasificacion.ts`, con fronteras exactas:
  - Velocidad: < 25 baja; 25 a < 30 media; >= 30 alta (24.99 baja, 25 media, 30 alta).
  - Distancia: < 5000 baja; 5000 a < 8000 media; >= 8000 alta.
  - Recuperación: < 60 rápida; 60 a 120 normal; > 120 lenta (120 normal, 120.01 lenta).
  - Frecuencia cardíaca: < 160 rango; 160 a 180 alta; > 180 alerta (180 alta, 181 alerta).
- Puntaje = velocidad + distancia + recuperación (cada una 2/1/0); rendimiento: 5-6 alto, 3-4 medio, 0-2 bajo. La frecuencia cardíaca NO suma al puntaje; solo genera alerta.
- Velocidad promedio = (distancia / tiempo) * 3.6 (km/h).
- Para respetar fronteras exactas, velocidades (km/h) y tiempo de prueba se guardan y comparan en centésimas enteras; distancia, recuperación, FC y sprints son enteros.
- Clasificaciones y puntaje se calculan al leer, no se guardan.
- Validaciones: edad 15 a 45; distancia y tiempo > 0; velocidad >= 0; FC 40 a 220; sprints y recuperación >= 0.

## Convenciones

- Identificadores, comentarios, mensajes y textos de interfaz en español.
- Reglas de negocio solo en `src/lib/reglas/`: funciones puras, sin `pg`, red, Next.js, `process.env` ni reloj (excepto fechas).
- Umbrales en `src/lib/config/rendimiento.ts`.
- Solo `src/lib/datos/` importa `src/lib/db/conexion.ts`. Rutas y páginas acceden a datos solo mediante `src/lib/dataService.ts`.
- Cada ruta de `src/app/api/rendimiento/` inicia con `await exigirSesion()`.
- Fechas `YYYY-MM-DD`; zona horaria `America/Bogota`; "hoy" solo con `hoyBogota()`.
- En rutas dinámicas `params` es una `Promise`: `const { codigo } = await params`.
- SQL siempre parametrizado; no concatenar valores.
- Un jugador se desactiva, no se elimina. Las mediciones no se editan; una nueva se agrega al historial.
- No instalar librerías de componentes; crear componentes locales bajo `src/components/ui/`.
