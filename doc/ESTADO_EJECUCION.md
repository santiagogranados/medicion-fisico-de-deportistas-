# Estado de ejecución

| Prompt | Estado | Resumen |
|---|---|---|
| P00 | Completado | Auditoría, dictamen, instrucciones, inventario de conexión por nombre y compilación base |
| P01 | Bloqueado | Migraciones y verificaciones preparadas; la conexión PostgreSQL al pooler expira |
| P02 | Completado | Reglas puras, T-01 a T-33 y validación de enteros/centésimas; suite total 46/46 |
| P03 | Completado local | Infraestructura de servidor, adaptador de sesión y API; PostgreSQL directo sigue sin validar |
| P04 | Bloqueado | Capa de datos implementada; `db:demo` y `probar:flujo` esperan conectividad PostgreSQL |
| P05 | Bloqueado | API implementada y acceso anónimo verificado; flujo autenticado con persistencia pendiente |
| P06 | Completado local | Navegación, lista filtrable, estados vacíos y estilos responsive |
| P07 | Completado local | Alta validada con vista previa y calculadora; persiste mediante API |
| P08 | Bloqueado | Ficha, alertas, historial y documentación implementados; aceptación E2E y verificación DB pendientes |
| P09 | Bloqueado por requisito | No iniciar hasta diligenciar aceptación y crear FASE_6_COMPLETADA según el gate del prompt |

## Bitácora

### P00 · 7 de noviembre de 2026

- Se copiaron a `doc/` el plan técnico y los prompts entregados en `Downloads`.
- Se auditó Next.js 15.5.25, React 19.3.0, TypeScript 5.9.3, dependencias, autenticación, datos, migraciones y estructura.
- Se confirmó por nombre y puerto que `MEDIFIS_POSTGRES_URL` usa pooler 6543; `MEDIFIS_POSTGRES_URL_NON_POOLING` usa 5432. No se registraron valores de conexión.
- `npm.cmd run build`: correcto.
- `npm.cmd test`: 4 archivos, 10 pruebas aprobadas.
- Se crearon `doc/ESTADO_ACTUAL.md`, `doc/DICTAMEN.md`, `.github/copilot-instructions.md` y este registro.
- No se modificaron código, configuración ni dependencias. Se deja P01 pendiente hasta presentar el dictamen y confirmar que se puede aplicar la migración al proyecto Supabase indicado.

### P01 · 7 de noviembre de 2026

- Se añadieron M1 y M2 con el esquema indicado en el plan, un runner ordenado con tabla `public._migrations`, y `db:migrar`/`db:verificar`.
- `pg` ya estaba presente; se agregó `@types/pg` con el gestor del proyecto.
- `node --check` pasó para los tres scripts.
- `npm.cmd test`: 4 archivos, 10 pruebas aprobadas. `npm.cmd run build`: correcto.
- `npm.cmd run db:migrar`: bloqueado al conectar, código `TIMEOUT`; no se confirmó la aplicación de M1/M2. Como la solicitud inicial pudo ejecutarse antes de perder la respuesta, no se puede afirmar si alcanzó a crear `public._migrations`.
- `npm.cmd run db:verificar`: `TIMEOUT`, total de fallas: 1. La comprobación TCP al puerto 6543 respondió, pero la sesión PostgreSQL no se estableció de forma estable. La migración y el estado de objetos quedan sin verificar.
- Se dejó P01 bloqueado y no se inició P02. No se imprimieron valores de conexión ni se hicieron commits.

### P02 · 7 de noviembre de 2026

- Se implementaron configuración de rendimiento, errores de negocio, fecha en Bogotá, cálculo de velocidad, clasificaciones, puntaje y validadores puros.
- Se agregaron los casos T-01 a T-33 sin cambiar la configuración de Vitest existente.
- `npm.cmd test`: inicialmente 8 archivos, 43 pruebas aprobadas (33 nuevas del dominio).
- `npm.cmd run type-check`: correcto.
- P01 continúa bloqueado por la conexión directa a PostgreSQL; P02 se pudo completar independientemente porque sus reglas son puras y no requieren base de datos. P04 queda pendiente de la base verificada.

### P03 · Servidor

- Se añadieron el pool PostgreSQL, el adaptador de sesión Supabase, utilidades HTTP y esquemas de entrada, protección del módulo y endpoint de sesión.
- `npm.cmd run type-check`, `npm.cmd test` y `npm.cmd run build` pasaron durante la implementación.
- Se verificó localmente que las rutas sin sesión responden 401 y la raíz redirige al módulo protegido/login.
- No se declara operativa la conexión PostgreSQL: el pooler sigue agotando el tiempo de espera. Ver [FASE_3_COMPLETADA.md](./checkpoints/FASE_3_COMPLETADA.md).

### P04–P05 · Datos y API

- Se implementaron operaciones parametrizadas para jugadores y mediciones, mapeo de centésimas, historial, clasificación al leer y rutas protegidas.
- Type-check, pruebas y build pasaron durante la implementación. La revisión de rutas confirma `exigirSesion()` antes de procesar cada handler y consultas parametrizadas.
- No se pudieron ejecutar `db:demo` ni `probar:flujo` contra Supabase por el timeout de PostgreSQL. Quedan pendientes las verificaciones que requieren persistencia real; no se registran resultados inventados. Ver [FASE_4_COMPLETADA.md](./checkpoints/FASE_4_COMPLETADA.md).

### P06–P07 · Interfaz base, registro y calculadora

- Se crearon componentes reutilizables, navegación móvil, lista filtrable, formulario de alta con validación en vivo y vista previa, y calculadora.
- El cálculo de la calculadora usa la regla compartida: 30 m en 4 s produce 27 km/h. La lista permite consultar por nombre y filtrar por posición.
- Se agregaron validaciones de distancia en metros enteros y precisión máxima de centésimas para tiempo y velocidades, consistentes con el esquema PostgreSQL.
- Type-check, lint, 46 pruebas y build pasaron tras P06–P08. El servidor local devolvió 500 porque una compilación de producción ejecutada mientras `next dev` estaba activo sobrescribió los artefactos `.next`; se reinició el servidor y `/login` volvió a responder 200. No volver a compilar mientras ese servidor siga ejecutándose.

### P08 · Ficha, alertas y aceptación (bloqueado)

- Se implementaron ficha de jugador, nueva medición, historial, clasificación por medición y panel de alertas con nota académica.
- La pantalla de error del módulo informa cuando PostgreSQL no responde, sin presentar una lista vacía como éxito.
- Se creó `doc/ACEPTACION.md` con A-01 a A-13; los resultados y evidencias se mantienen vacíos porque se deben ejecutar en Vercel con la base disponible.
- `.env.local` está excluido por `.gitignore`; no se copiaron valores de entorno a archivos versionados.
- No se corrieron `probar:flujo`, `db:limpiar --prueba` ni aceptación remota: la conectividad PostgreSQL no está resuelta. No se crea `FASE_6_COMPLETADA.md` y no se marca P08 terminado hasta completar esas verificaciones.
- Al reportarse un 500, los registros mostraron primero artefactos `.next` faltantes porque `next build` se ejecutó mientras `next dev` estaba activo; reiniciar el servidor restableció `/login` (HTTP 200). La consulta posterior a `/rendimiento` mostró timeout PostgreSQL, causa persistente que requiere resolver la conexión.

### P09 · Opcionales

- No iniciado: el prompt exige `FASE_6_COMPLETADA.md` y aceptación diligenciada. Se conserva este gate y no se añadieron funcionalidades opcionales fuera de secuencia.
