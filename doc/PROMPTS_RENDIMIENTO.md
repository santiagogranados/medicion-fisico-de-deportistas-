# Rendimiento Físico · Prompts para GitHub Copilot

> Plan de referencia: `doc/PLAN_RENDIMIENTO.md`
> Herramienta: GitHub Copilot Chat en modo Agente (VS Code)
> Punto de partida: por confirmar en P00 (el primer prompt averigua qué hay montado)

---

## El primer prompt concilia

El primer prompt (P00) audita el repositorio (proyecto Next, Supabase, login) y escribe un dictamen de qué usar, qué adaptar y qué crear. La conexión a Postgres se asume ya copiada en `.env.local` desde Vercel; el P00 solo confirma el nombre de la variable. Lee `doc/DICTAMEN.md` después de P00.

## Cómo ejecutar estos prompts

1. Crear la carpeta `doc/` en la raíz del repositorio (si no existe) y copiar allí `PLAN_RENDIMIENTO.md` y `PROMPTS_RENDIMIENTO.md`.
2. Abrir el proyecto en VS Code y abrir Copilot Chat. En el selector de modo elegir **Agent**. En el selector de modelo elegir el más capaz disponible.
3. Cada prompt se ejecuta en una **conversación nueva** (botón `+` del chat).
4. Copiar el bloque gris completo del prompt, pegarlo en el chat y enviarlo. No hay datos que reemplazar.
5. Cuando Copilot pida permiso para ejecutar un comando en la terminal, leerlo y aceptarlo.
6. Al terminar cada prompt: revisar los cambios y aceptarlos (**Keep**); hacer la verificación indicada; hacer commit con el mensaje sugerido y `git push`. Vercel desplegará; si falla, usar el prompt de despliegue fallido antes de continuar.
7. No saltar prompts. Si algo falla, usar el prompt de corrección del final.

| Fase | Prompts |
|---|---|
| 0 · Conciliación | P00 |
| 1 · Base de datos | P01 |
| 2 · Reglas de negocio | P02 |
| 3 · Servidor | P03 |
| 4 · Datos y API | P04, P05 |
| 5 · Interfaz | P06, P07, P08 |
| 7 · Opcionales | P09 |

---

## P00 · Conciliación: qué hay, qué falta, qué se crea

**Fase:** 0 · **Modifica código:** no · **Crea:** `doc/ESTADO_ACTUAL.md`, `doc/DICTAMEN.md`, `.github/copilot-instructions.md`, `doc/ESTADO_EJECUCION.md`, `doc/checkpoints/FASE_0_COMPLETADA.md`

````text
Actúa como ingeniero de software senior trabajando en modo agente sobre este repositorio.

Contexto: el proyecto "Rendimiento Físico" (medición y seguimiento del rendimiento de futbolistas: registro, clasificaciones por umbral, puntaje y alertas) se construye sobre el stack del curso (Next.js + TypeScript + Tailwind + Supabase + Vercel). Es un proyecto académico: datos simulados, alertas que no son diagnósticos médicos. NO se da por hecho que la infraestructura esté montada. Este prompt NO implementa funcionalidades: audita lo que exista y produce un dictamen. El plan técnico está en doc/PLAN_RENDIMIENTO.md.

Lee completo doc/PLAN_RENDIMIENTO.md, en especial las secciones 0, 1, 2, 3, 5, 6 y 17.

TAREA 1. Crea doc/ESTADO_ACTUAL.md con una radiografía fiel. No supongas: revisa el repositorio. Secciones:
1. ¿Hay un proyecto Next.js con TypeScript? Versión de next, react, typescript, tailwindcss; si no hay package.json o no es Next, dilo claramente.
2. Scripts de package.json.
3. Estructura: árbol de app/, lib/, components/, supabase/, scripts/ hasta 3 niveles; indica si usa src/.
4. Dependencias relevantes presentes o ausentes: pg, zod, @supabase/supabase-js, vitest. Marca cuáles FALTAN.
5. Autenticación: ¿hay login? Si lo hay, archivos, mecanismo, función de sesión, ruta de login, a dónde redirige. Si NO hay, indícalo (se agrega en P03).
6. Base de datos: ¿hay una variable de conexión directa a Postgres en .env.local? (solo NOMBRES, nunca valores). Indica cuál es y su nombre exacto; se asume ya copiada desde Vercel.
7. Dónde viven los datos hoy, si hay algo.
8. Migraciones: ¿mecanismo? Si no, se crea.
9. Qué del dominio ya está construido: jugadores, mediciones, clasificaciones. Estado de cada uno.
10. Estilos: versión de Tailwind, globals.css, tokens, fuentes.
11. Pruebas: framework (Vitest u otro) y pruebas existentes.
12. Conflictos: existencia previa de app/rendimiento, app/api/rendimiento, lib/dataService, components/ui; contenido de app/page.tsx; tablas jugadores/mediciones.
13. Decisiones derivadas: ¿hay base Next o hay que crear el proyecto?; ruta de login (existe o se agrega); archivo de protección (proxy.ts en Next 16, middleware.ts antes); mecanismo de migraciones; nombre de la variable de conexión a Postgres; nombres de M1 y M2; prefijo de imports; dónde está app/.
14. Compilación de base: resultado de npm run build (TAREA 4).

TAREA 2. Crea doc/DICTAMEN.md: para cada pieza de INFRAESTRUCTURA (proyecto Next/TS, Tailwind, conexión Supabase/Postgres, login, migraciones) y cada funcionalidad del módulo mínimo (F1 registrar jugador, F2 velocidad promedio, F3 clasificar y puntuar, F4 consultar, F5 alertas), di su estado y qué hacer:

```markdown
## [Pieza o funcionalidad]
- Estado: EXISTE Y SIRVE | EXISTE PARCIAL | NO EXISTE
- Qué hacer: USAR | ADAPTAR | CREAR
- Detalle: [qué exactamente, en qué prompt]
```

Si algo EXISTE Y SIRVE, se USA; si EXISTE PARCIAL, se ADAPTA; si NO EXISTE, se CREA. Incluye una tabla resumen y una lista de "qué necesita conseguir la estudiante" (crear el proyecto Supabase si no existe, confirmar la conexión en .env.local).

TAREA 3. Crea .github/copilot-instructions.md reemplazando [AJUSTAR] con lo hallado:

```markdown
# Rendimiento Físico · Instrucciones para Copilot

## Documentos rectores
- Plan técnico: doc/PLAN_RENDIMIENTO.md. Si una instrucción contradice el plan, prevalece el plan.
- Estado real del repositorio: doc/ESTADO_ACTUAL.md.
- Dictamen de conciliación: doc/DICTAMEN.md. Antes de crear algo, revisa si dice USAR (ya existe).
- Avance: doc/ESTADO_EJECUCION.md.

## Stack objetivo
- Next.js App Router + TypeScript + Tailwind CSS. Despliegue en Vercel.
- Postgres de Supabase con el paquete pg y la variable [AJUSTAR: conexión]. (pg [AJUSTAR: está / falta].)
- Validación con Zod. Pruebas con Vitest.
- Login: [AJUSTAR: existe / se agrega en P03] como puerta única, sin roles.

## Proyecto académico
- Datos simulados; las clasificaciones y alertas son indicadores del proyecto, no diagnósticos médicos. Los textos de la interfaz lo aclaran.

## Lo más importante del dominio
- Clasificaciones por umbral (lib/reglas/clasificacion.ts), con casos límite exactos:
  · Velocidad: < 25 baja; 25 a < 30 media; >= 30 alta (24.99 baja, 25 media, 30 alta).
  · Distancia: < 5000 baja; 5000 a < 8000 media; >= 8000 alta.
  · Recuperación: < 60 rápida; 60 a 120 normal; > 120 lenta (120 normal, 120.01 lenta).
  · Frecuencia cardíaca: < 160 rango; 160 a 180 alta; > 180 alerta (180 alta, 181 alerta).
- Puntaje = velocidad + distancia + recuperación (cada una 2/1/0); rendimiento: 5-6 alto, 3-4 medio, 0-2 bajo. La frecuencia cardíaca NO suma al puntaje; solo genera alerta.
- Velocidad promedio = (distancia / tiempo) * 3.6 (km/h).
- Para respetar las fronteras exactas, las velocidades (km/h) y el tiempo de prueba se guardan y se comparan en CENTÉSIMAS enteras; distancia, recuperación, FC y sprints son enteros.
- Las clasificaciones y el puntaje se calculan al leer, no se guardan.
- Validaciones (regla 6): edad 15 a 45; distancia y tiempo > 0; velocidad >= 0; FC 40 a 220; sprints y recuperación >= 0.

## Convenciones
- Identificadores, comentarios, mensajes y textos de interfaz en español.
- Reglas de negocio solo en lib/reglas/: funciones puras, sin pg, sin red, sin variables de entorno y sin reloj (excepto fechas.ts). Se prueban con Vitest.
- Los umbrales viven en lib/config/rendimiento.ts.
- Solo lib/datos/ importa lib/db/conexion.ts. Rutas y páginas importan datos únicamente desde lib/dataService.ts.
- Toda ruta en app/api/rendimiento/ llama await exigirSesion() como primera instrucción.
- Fechas 'YYYY-MM-DD'. Zona horaria America/Bogota; "hoy" solo con hoyBogota().
- En rutas dinámicas params es una Promise: const { codigo } = await params.
- SQL siempre con parámetros. Nunca concatenar valores.
- Un jugador se desactiva, no se elimina. Las mediciones no se editan; una nueva se agrega al historial.
- No instalar librerías de componentes (shadcn, MUI u otras). Usar components/ui/.
- Prefijo de imports para lib: [AJUSTAR]. Archivo de protección: [AJUSTAR]. Ruta de login: [AJUSTAR].

## Al terminar cada tarea
1. npm run build sin errores.
2. npm test sin fallas (desde que exista Vitest).
3. Actualizar doc/ESTADO_EJECUCION.md.
4. No hacer commit: la estudiante revisa y hace el commit.
```

TAREA 4. Si hay proyecto Next y falta node_modules, ejecuta npm install y luego npm run build; registra el resultado en la sección 14 de ESTADO_ACTUAL.md. Si no hay proyecto o falla, NO lo arregles: descríbelo y dilo en el dictamen.

TAREA 5. Crea doc/ESTADO_EJECUCION.md con la tabla de prompts (P00 a P09) en estado pendiente y una sección de bitácora.

TAREA 6. Revisa .env.local y dime qué variable de conexión a Postgres hay (se asume copiada desde Vercel). Confírmame su nombre exacto (puede ser DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL u otro) y cuál debe usar lib/db/conexion.ts: la del pooler (puerto 6543), adecuada para `pg` en serverless; si hay una de puerto 5432 (non-pooling), no es esa. Si en .env.local no hay ninguna, avísame para copiarla desde Vercel antes de P01. Solo confírmame el nombre.

RESTRICCIONES: no modifiques código, configuración ni dependencias. Solo creas los archivos de este prompt.

AL TERMINAR:
- Crea doc/checkpoints/FASE_0_COMPLETADA.md con: estado de la infraestructura, resumen del dictamen y qué necesita conseguir la estudiante.
- Marca P00 en ESTADO_EJECUCION.md.
- Muéstrame el dictamen resumido y el nombre de la variable de conexión antes de seguir con P01.
````

**Verificación del estudiante:** leer `doc/DICTAMEN.md`. Dice qué ya tienes, qué falta y qué se va a crear, y confirma el nombre de la variable de conexión (la del pooler, 6543).

**Commit sugerido:** `docs: conciliación y dictamen de Rendimiento Físico`

---

## P01 · Base de datos del módulo

**Fase:** 1 · **Crea o usa:** dependencia `pg`, migraciones M1 y M2, `scripts/verificar-bd.mjs`, `scripts/migrar.mjs`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 5, 6, 8, 9 y 15), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Si el dictamen dice que falta la conexión a Postgres, detente y avísame.

OBJETIVO: crear las tablas en Supabase Postgres y dejar un script que demuestre que la base protege las reglas (código único, edad y FC en rango, cantidades positivas).

TAREA 1. Si falta pg, agrégalo (y @types/pg).

TAREA 2. Crea en supabase/migrations/ dos archivos con los nombres de la sección 13 de ESTADO_ACTUAL.md:
- M1 (tablas jugadores, mediciones) con el SQL exacto de la sección 9.2 del plan.
- M2 (vista v_jugadores y seguridad) con el SQL exacto de la sección 9.3.
No cambies nombres, columnas ni restricciones: el código depende de ellos (sección 9.4). Nota: las velocidades y el tiempo de prueba se guardan en centésimas enteras.

TAREA 3. Aplica las migraciones con el mecanismo existente o creando scripts/migrar.mjs (patrón estándar: variable de conexión, tabla _migrations, orden alfabético, transacción, aplicada/omitida, código 1 si falla) y "db:migrar". Ejecútalo.

TAREA 4. Crea scripts/verificar-bd.mjs y "db:verificar". Debe imprimir:
1. Existencia de jugadores, mediciones y la vista v_jugadores.
2. Número de filas de cada tabla.
3. Restricciones e índices: jugadores_codigo_unico, jugadores_edad_valida, med_distancia_positiva, med_tiempo_positivo, med_fc_valida.
4. Si RLS está activo en las dos tablas.
5. Pruebas de integridad en UNA transacción que SIEMPRE termina en ROLLBACK, con SAVEPOINT antes de cada caso que debe fallar:
   a) Crear jugador código 901 "Verif": funciona; crear código 901 otra vez: 23505 (jugadores_codigo_unico).
   b) Crear jugador con edad 14: 23514 (jugadores_edad_valida); con edad 46: 23514.
   c) Insertar medición con distancia 0: 23514 (med_distancia_positiva).
   d) Insertar medición con tiempo_prueba_cent 0: 23514 (med_tiempo_positivo).
   e) Insertar medición con frecuencia_cardiaca 230: 23514 (med_fc_valida); con 39: 23514.
   f) Insertar medición con sprints −1: 23514.
   g) Insertar una medición válida (distancia 8200, tiempo 400 cent = 4 s, vel_max 3240 cent, vel_prom 2700 cent, FC 175, recup 55, sprints 18) y comprobar que v_jugadores la devuelve como la más reciente del jugador.
   Imprime OK o FALLA por caso.
6. Total de fallas; código 1 si hubo alguna.

Ejecuta npm run db:verificar y copia la salida en la bitácora.

RESTRICCIONES: no modifiques el login ni app/. No crees tablas distintas a las del plan.

AL TERMINAR:
- npm run build sin errores.
- Crea doc/checkpoints/FASE_1_COMPLETADA.md con la salida de db:verificar.
- Marca P01 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** en Supabase aparecen `jugadores` y `mediciones`. La salida de `npm run db:verificar` no tiene FALLA; los casos b y e confirman los rangos de edad y FC.

**Commit sugerido:** `feat(bd): jugadores, mediciones y vista con la medición reciente`

---

## P02 · Reglas de negocio y pruebas unitarias

**Fase:** 2 · **Crea:** `lib/config/rendimiento.ts`, `lib/reglas/*`, `tests/reglas/*`, `vitest.config.ts`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 5, 6, 8, 10, 11.2 y 16.1), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: implementar las reglas puras y probarlas con Vitest. El núcleo son las clasificaciones por umbral (con sus casos límite), la velocidad promedio y el puntaje; se prueban a fondo.

TAREA 1. Si falta Vitest, instálalo y configúralo (environment node, include ['tests/**/*.test.ts'], alias de tsconfig). Si ya hay Vitest, respétalo.

TAREA 2. Crea lib/config/rendimiento.ts con el contenido exacto de la sección 10.4 (posiciones, rangos de edad y FC, umbrales de clasificación, zona horaria).

TAREA 3. Crea lib/reglas/ con las firmas de la sección 10.5 y los cálculos de la sección 8:
- errores.ts: CodigoError; MENSAJES y ESTADO_HTTP (tabla 11.2); clase ErrorDeNegocio.
- fechas.ts: hoyBogota.
- calculos.ts: velocidadPromedioKmh(distanciaM, tiempoS) = Math.round((dist/tiempo)*3.6*100)/100 (RN-01).
- clasificacion.ts: NivelVelDist, NivelRecup, NivelFC; clasificarVelocidad(kmh) (compara en centésimas: <2500 baja, <3000 media, si no alta); clasificarDistancia(metros) (<5000 baja, <8000 media, si no alta); clasificarRecuperacion(segundos) (<60 rápida, <=120 normal, si no lenta); clasificarFrecuencia(ppm) (<160 rango, <=180 alta, si no alerta); calcularRendimiento({velocidadMaxima, distancia, recuperacion}) (puntos 2/1/0 de velocidad+distancia+recuperación; rendimiento 5-6 alto, 3-4 medio, 0-2 bajo; la FC NO suma).
- jugador.ts: validarJugador({nombre, edad, posicion}) (nombre y posición no vacíos; edad 15 a 45; RN-07, RN-12).
- medicion.ts: validarMedicion({distancia, tiempoPrueba, velocidadMaxima, frecuenciaCardiaca, recuperacion, sprints}) (distancia>0; tiempo>0; velocidad>=0; FC 40 a 220; recuperacion>=0; sprints>=0; RN-08, RN-09, RN-10).

Ninguna regla importa pg, red, next ni process.env, ni llama new Date() (excepto el parámetro por defecto de hoyBogota).

TAREA 4. Crea tests/reglas/ayudas.ts con esperarCodigo(fn, codigo). Crea las pruebas (clasificacion, calculos, jugador, medicion) cubriendo T-01 a T-33 de la sección 16.1. Cada caso con su ID. Lo crítico son los casos límite exactos: velocidad 24.99/25/29.99/30; distancia 4999/5000/7999/8000; recuperación 59/60/120/120.01; FC 159/160/180/181; y los puntajes de ejemplo (Carlos 6/alto, Mateo 3/medio, Daniel 2/bajo, el caso 30/8000/60 → 5/alto). Comprueba también los bordes de validación (edad 15 y 45 válidas, 14 y 46 no; FC 40 y 220 válidas, 39 y 221 no).

TAREA 5. Ejecuta npm test hasta que pasen las 33. Si una falla, corrige la regla, no la prueba, salvo que contradiga el plan; explícalo.

RESTRICCIONES: no toques app/, el login ni la base de datos.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_2_COMPLETADA.md con la salida de npm test.
- Marca P02 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** `npm test` (33 pruebas). Abrir `lib/reglas/clasificacion.ts` y comprobar los bordes exactos (24,99 baja, 25 media, 30 alta; 120 normal, 120,01 lenta; 180 alta, 181 alerta).

**Commit sugerido:** `feat(reglas): clasificaciones, velocidad y puntaje con 33 pruebas`

---

## P03 · Infraestructura del servidor

**Fase:** 3 · **Crea:** conexión, sesión (login como puerta), respuestas, esquemas, formato · **Modifica:** protección de rutas

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 1.3, 4, 9.4, 10, 11.1, 11.2, 11.4, 14 y 15), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: la infraestructura del servidor y el acceso.

TAREA 1. lib/db/conexion.ts como la sección 10.7 (con los parsers). Usa el nombre real de la variable de conexión que confirmó P00 (la del pooler, 6543).

TAREA 2. Login y sesión:
- Si el dictamen dice que hay login: crea lib/auth/sesion.ts que lo envuelve (obtenerSesion, exigirSesion) sin reescribirlo.
- Si NO hay login: agrega uno mínimo como puerta (página /login con contraseña de acceso en variable de entorno y cookie de sesión firmada; el mecanismo más simple y seguro que encaje con la versión de Next). Documenta la decisión. Sin roles.
- exigirSesion() lanza ErrorDeNegocio('NO_AUTORIZADO') si no hay sesión.

TAREA 3. Protección de rutas (proxy.ts en Next 16, o el archivo del dictamen): protege /rendimiento/:path* y /api/rendimiento/:path*. Sin sesión: páginas a /login; API 401 con el formato de la sección 11.1.

TAREA 4. Tras iniciar sesión, redirige a /rendimiento. app/page.tsx redirige a /rendimiento (o a /login si no hay sesión).

TAREA 5. lib/http/respuestas.ts: responderOk; responderError (ErrorDeNegocio → ESTADO_HTTP; ZodError → 400 DATOS_INVALIDOS con flatten; pg 23505/23503/23514 → tabla 9.4 por error.constraint; otro → console.error y 500 ERROR_INTERNO); conManejoDeErrores; leerCuerpo. Todas con Cache-Control: no-store.

TAREA 6. lib/validacion/esquemas.ts con los esquemas de la sección 11.4, con tipos z.infer. No importa nada del servidor.

TAREA 7. lib/formato.ts: formatearVelocidad (recibe centésimas, muestra km/h); formatearFecha; formatearDistancia (metros con separador de miles).

TAREA 8. app/api/rendimiento/sesion/route.ts: GET con conManejoDeErrores; primera instrucción await exigirSesion(); responde { email }. export const dynamic = 'force-dynamic'.

VERIFICACIÓN: npm run build y npm test. Inicia npm run dev; sin sesión, la ruta de sesión da 401 y /rendimiento redirige al login. Inicia sesión y comprueba que llega a /rendimiento.

AL TERMINAR:
- Crea doc/checkpoints/FASE_3_COMPLETADA.md con los resultados y la decisión de login.
- Marca P03 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** sin sesión, `/rendimiento` redirige al login; con sesión, entra.

**Commit sugerido:** `feat(servidor): conexión, login de acceso y utilidades de API`

---

## P04 · Datos: jugadores y mediciones

**Fase:** 4 (primera parte) · **Crea:** `lib/datos/*`, `lib/dataService.ts`, scripts de prueba y demo

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 5, 6, 7, 7.1, 8, 9, 10.5, 10.6 y 16.2), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Revisa lib/reglas/, lib/db/conexion.ts y lib/validacion/esquemas.ts.

OBJETIVO: la capa de datos y los casos de uso contra Postgres, y comprobar el flujo. Lo crítico: guardar velocidades y tiempo en centésimas, calcular las clasificaciones al leer, y el historial de mediciones.

TAREA 1. lib/datos/tipos.ts con los tipos de la sección 10.6. Las velocidades se exponen en km/h (decimal) hacia afuera; por dentro se guardan en centésimas.

TAREA 2. lib/datos/jugadores.ts:
- listarJugadores({ posicion, incluirInactivos }) desde v_jugadores; por cada jugador calcula sus clasificaciones y el rendimiento con lib/reglas/clasificacion.ts (convirtiendo centésimas a km/h).
- registrarJugador(d): secuencia de la sección 7.1 (validarJugador; validarMedicion; en transacción, insertar el jugador —JUGADOR_DUPLICADO si choca— y su primera medición con velocidadPromedioKmh y las velocidades en centésimas). Devuelve el jugador con su rendimiento.
- consultarJugador(codigoONombre): por código (número) o por nombre; JUGADOR_NO_ENCONTRADO si no.
- desactivarJugador(codigo): activo = false.

TAREA 3. lib/datos/mediciones.ts:
- registrarMedicion(codigo, d): validarMedicion; inserta una nueva medición para el jugador (con velocidad promedio y centésimas); pasa a ser la más reciente. Devuelve el jugador con su rendimiento.
- historialMediciones(codigo): mediciones del jugador, de la más reciente a la más antigua (convertidas a km/h y segundos).

TAREA 4. lib/datos/estadisticas.ts: créalo preparado para las opcionales (F6, F7, F8); en el mínimo no se usa.

TAREA 5. Funciones del MVP sueltas en dataService: calcularVelocidad(distancia, tiempo) (devuelve { ms, kmh }); listarAlertas() (jugadores con velocidad baja, recuperación lenta o FC de alerta, calculado con las reglas).

TAREA 6. lib/dataService.ts como fachada: reexporta las funciones públicas y los tipos. Verifica que ningún archivo fuera de lib/datos importe lib/db/conexion.ts, y que la conversión km/h ↔ centésimas se haga en la frontera.

TAREA 7. scripts/limpiar-prueba.mjs ("db:limpiar") y scripts/cargar-demo.ts ("db:demo"): demo con los jugadores de ejemplo del plan (Carlos, Juan, Andrés, Mateo, Daniel) con sus mediciones. Limpia los demo antes. Ejecútalo.

TAREA 8. Instala tsx si falta. scripts/probar-flujo.ts ("probar:flujo") con los 12 pasos de la sección 16.2 usando solo dataService. Imprime OK/FALLA por paso; los que esperan error verifican el código; limpia antes y en finally; cierra el pool; código 1 si hay fallas. CRÍTICO: el paso 1 comprueba que Carlos da puntaje 6 y rendimiento alto; el 6 que Daniel da 2 y bajo; el 10 que 30 m / 4 s da 27 km/h; validaciones de edad y FC. Ejecuta y corrige hasta 0 fallas.

RESTRICCIONES: no romper el login ni las pruebas. No dupliques lógica (vive en lib/reglas/).

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P04 en ESTADO_EJECUCION.md y agrega la salida de probar:flujo y db:demo en la bitácora. La fase 4 sigue abierta hasta P05.
- Muéstrame un resumen.
````

**Verificación del estudiante:** `npm run probar:flujo` (12 OK, 0 fallas). El paso 1 confirma el rendimiento de Carlos (6/alto) y el 10 la velocidad promedio (27 km/h).

**Commit sugerido:** `feat(datos): jugadores y mediciones con clasificación calculada`

---

## P05 · API

**Fase:** 4 (cierre) · **Crea:** rutas de `app/api/rendimiento/`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 11.1 a 11.4), doc/ESTADO_EJECUCION.md, lib/dataService.ts, lib/http/respuestas.ts, lib/validacion/esquemas.ts y lib/auth/sesion.ts.

OBJETIVO: exponer las operaciones del módulo mínimo con rutas protegidas.

TAREA 1. Crea las rutas del módulo mínimo de la tabla 11.3 (deja comparar y equipo para P09). Reglas de cada handler:
- Primera instrucción: await exigirSesion().
- conManejoDeErrores; cuerpos con leerCuerpo y los esquemas de 11.4; filtros validados.
- [codigo] con await params.
- export const dynamic = 'force-dynamic'.
- POST de crear y de medición responden 201.
- GET /api/rendimiento/jugadores/[codigo] acepta código o nombre; POST /api/rendimiento/velocidad calcula la velocidad promedio suelta.

TAREA 2. Verificación sin sesión: con npm run dev, GET /api/rendimiento/jugadores y POST /api/rendimiento/jugadores deben dar 401.

TAREA 3. Verificación con sesión: pídeme que inicie sesión. Registra el jugador Carlos del plan y comprueba que llega con rendimiento Alto (6/6); registra uno con edad 14 (400) y otro con FC 230 (400); consulta por código y por nombre; calcula la velocidad de 30 m / 4 s (27 km/h); mira las alertas. Documenta.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_4_COMPLETADA.md con probar:flujo (P04) y las verificaciones.
- Marca P05 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** las rutas dan 401 sin sesión; con sesión, registrar a Carlos devuelve rendimiento Alto y las validaciones de edad y FC rechazan con su mensaje.

**Commit sugerido:** `feat(api): rutas de jugadores, mediciones y velocidad`

---

## P06 · Interfaz base y lista de jugadores

**Fase:** 5 · **Crea:** `components/ui/*`, layout de `/rendimiento`, lista de jugadores · **Modifica:** `app/globals.css`, `app/page.tsx`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 4, 5, 11, 12, 13), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: componentes reutilizables, navegación y la lista de jugadores con su rendimiento.

TAREA 1. Agrega los tokens de color de la sección 13 sin borrar nada existente (Tailwind 4: @theme; Tailwind 3: tailwind.config).

TAREA 2. components/ui/: Boton (primario, secundario, peligro, fantasma; prop cargando), Campo, Selector, Tarjeta, Insignia (tono neutro, alto, medio, bajo), Aviso (info, exito, advertencia, error), EstadoVacio. Foco visible y contraste.

TAREA 3. app/page.tsx: redirección a /rendimiento (o a /login si no hay sesión).

TAREA 4. components/rendimiento/NavegacionRendimiento.tsx y app/rendimiento/layout.tsx (servidor): obtenerSesion(); sin sesión, redirect al login. Barra con "Rendimiento Físico", enlaces Jugadores, Alertas, Calculadora (y Comparar/Equipo cuando existan); cerrar sesión. Un aviso una vez con el texto académico de la sección 12.1. Menú móvil.

TAREA 5. components/rendimiento/InsigniaNivel.tsx (baja/media/alta y rápida/normal/lenta, con texto) e InsigniaRendimiento.tsx (Alto/Medio/Bajo con color y texto).

TAREA 6. components/rendimiento/TablaJugadores.tsx y app/rendimiento/page.tsx (servidor): listarJugadores; columnas código, nombre, posición, velocidad máxima, distancia, recuperación y el rendimiento general (InsigniaRendimiento). Filtro por posición. Botón "Registrar jugador". EstadoVacio si no hay. Tarjetas apiladas en móvil.

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Con los datos demo: ver la lista con el rendimiento de cada jugador; filtrar por posición; ver el aviso académico. Revisa en móvil.

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P06 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** ver la lista de jugadores con su rendimiento (Alto/Medio/Bajo) y el aviso académico.

**Commit sugerido:** `feat(interfaz): lista de jugadores con su rendimiento`

---

## P07 · Registro de jugador y calculadora

**Fase:** 5 · **Crea:** formulario de registro y la calculadora de velocidad

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 5, 6, 7, 8, 11, 12), doc/ESTADO_EJECUCION.md y los componentes existentes.

OBJETIVO: registrar un jugador con su medición (con las validaciones de la regla 6) y la calculadora de velocidad promedio.

TAREA 1. components/rendimiento/FormularioJugador.tsx (cliente) y app/rendimiento/jugadores/nuevo/page.tsx: nombre, edad, posición (selector), código, y las mediciones (distancia, tiempo de prueba, velocidad máxima, FC, recuperación, sprints). Validación en vivo con las reglas; los rechazos de la regla 6 (edad 15-45, distancia y tiempo > 0, FC 40-220, etc.) muestran su mensaje. Muestra en vivo la velocidad promedio calculada y las clasificaciones que resultarían. POST /api/rendimiento/jugadores; al guardar, va a la ficha.

TAREA 2. components/rendimiento/Calculadora.tsx y app/rendimiento/calculadora/page.tsx: distancia y tiempo; muestra m/s y km/h (funcionalidad 2 como herramienta suelta), usando POST /api/rendimiento/velocidad o el cálculo en el cliente con la misma función de reglas.

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Registrar un jugador y ver su velocidad promedio y clasificaciones en vivo; intentar edad 14 (rechazo) y FC 230 (rechazo); usar la calculadora con 30 m y 4 s (27 km/h). Documenta.

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P07 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** registrar un jugador con las validaciones activas; usar la calculadora y ver 27 km/h para 30 m en 4 s.

**Commit sugerido:** `feat(interfaz): registro de jugador y calculadora de velocidad`

---

## P08 · Ficha, alertas y aceptación del MVP

**Fase:** 5 y 6 · **Crea:** la ficha del jugador, las alertas, `doc/ACEPTACION.md` · **Modifica:** `README.md`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 5, 6, 8, 11, 12, 14, 15, 16 y 17), doc/ESTADO_EJECUCION.md y los componentes existentes.

OBJETIVO: la ficha del jugador con sus clasificaciones y el puntaje, el panel de alertas, y el cierre del MVP con la aceptación.

TAREA 1. components/rendimiento/FichaJugador.tsx y app/rendimiento/jugadores/[codigo]/page.tsx (servidor): consultarJugador (notFound si no existe). Muestra los datos del jugador y su medición más reciente, las cuatro clasificaciones (velocidad, distancia, recuperación con InsigniaNivel; FC con su nivel y, si es alerta, un PanelAlertas con la nota académica), el puntaje (x/6) y el rendimiento general, como el ejemplo del plan. Botón "Nueva medición" (abre un formulario de medición; POST a la ruta de mediciones). Historial de mediciones (opcional, si está F9).

TAREA 2. components/rendimiento/PanelAlertas.tsx y app/rendimiento/alertas/page.tsx (servidor): listarAlertas; lista los jugadores con velocidad baja, recuperación lenta y FC de alerta, cada grupo con su etiqueta y la nota de que son indicadores académicos, no diagnósticos médicos.

TAREA 3. Revisa el código contra las secciones 5, 8 y 15. Reporta y corrige en la bitácora: clasificaciones fuera de lib/reglas/ o que no respeten los bordes (24.99 vs 25); velocidades operadas en decimal en vez de centésimas; la FC sumando al puntaje (no debe); clasificaciones guardadas en vez de calculadas; textos de alerta sin la nota académica; "hoy" con new Date() fuera de fechas.ts; rutas sin exigirSesion; SQL concatenado; clasificación comunicada solo con color.

TAREA 4. Ejecuta npm test y npm run probar:flujo; corrige fallas en el código. Prepara la aceptación: db:limpiar --prueba; conserva los demo.

TAREA 5. Crea doc/ACEPTACION.md con la tabla A-01 a A-13 de la sección 16.3 (columnas: ID, acción, resultado esperado, resultado obtenido, evidencia, observación; las tres últimas vacías) y una nota de que A-14 es de la opcional (P09).

TAREA 6. Actualiza README.md: descripción (con la nota de que es académico, no médico); funcionalidades; requisitos; cómo correr en local (npm install, .env.local con los NOMBRES de las variables, db:migrar, db:demo, dev); scripts; una nota sobre las clasificaciones por umbral, el puntaje (0 a 6) y el manejo de centésimas para las fronteras; enlace a doc/PLAN_RENDIMIENTO.md.

TAREA 7. Verifica que .env.local esté en .gitignore y que ningún archivo versionado tenga valores de variables de entorno.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_5_COMPLETADA.md (interfaz) y doc/checkpoints/FASE_6_COMPLETADA.md (revisión y pruebas).
- Marca P08 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen y recuérdame que A-01 a A-13 se ejecutan en el despliegue de Vercel.
````

**Verificación del estudiante:** ver la ficha de un jugador tal como el ejemplo del plan (clasificaciones, puntaje x/6, rendimiento); ver las alertas con la nota académica. Hacer push y ejecutar A-01 a A-13 en Vercel.

**Commit sugerido:** `feat(interfaz): ficha del jugador, alertas y aceptación del MVP`

---

## P09 · Opcionales: comparar, estadísticas, ranking e historial

**Fase:** 7 · **Requisito:** `doc/checkpoints/FASE_6_COMPLETADA.md` existe y `doc/ACEPTACION.md` está diligenciado

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md (secciones 3.2, 7 (CU-06), 11.3, 16.3 (A-14) y 18), doc/ESTADO_EJECUCION.md y doc/checkpoints/FASE_6_COMPLETADA.md. Si FASE_6_COMPLETADA.md no existe, detente y avísame.

OBJETIVO: las funcionalidades opcionales del plan.

TAREA 1. F6 · Comparar jugadores:
- compararJugadores(codigos): dos o más jugadores con sus mediciones y clasificaciones lado a lado. Reexporta en dataService. Ruta POST /api/rendimiento/comparar; pantalla /rendimiento/comparar con la selección.

TAREA 2. F7 · Estadísticas del equipo y F8 · Ranking:
- estadisticasEquipo(): promedio de velocidad y de distancia del equipo (sobre la medición más reciente de cada jugador activo), ranking por velocidad máxima, y permite filtrar por posición. Reexporta en dataService. Ruta GET /api/rendimiento/equipo; pantalla /rendimiento/equipo.

TAREA 3. F9 · Historial de mediciones:
- historialMediciones(codigo) (ya en P04): muéstralo en la ficha del jugador, de la más reciente a la más antigua, con las clasificaciones de cada una.

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Con los datos demo: comparar dos o tres jugadores; ver el promedio de velocidad y distancia del equipo y el ranking; registrar una segunda medición a un jugador y ver su historial. Documenta.

AL TERMINAR:
- npm run build y npm test sin errores.
- Agrega a doc/ACEPTACION.md el resultado de A-14.
- Crea doc/checkpoints/FASE_7_COMPLETADA.md.
- Marca P09 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** comparar jugadores; ver las estadísticas y el ranking del equipo; ver el historial de un jugador.

**Commit sugerido:** `feat(opcional): comparar, estadísticas, ranking e historial`

---

## Prompts auxiliares

### Corrección de un error

Reemplazar `[NN]` por el número del prompt y pegar el error completo donde se indica.

````text
Durante la ejecución del prompt P[NN] apareció este error:

[PEGAR AQUÍ EL ERROR COMPLETO]

Lee doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md, doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Encuentra la causa y corrígela sin salir del alcance de P[NN]. No modifiques pruebas ni scripts de prueba para que pasen; corrige el código que prueban. Ejecuta npm run build y npm test. Registra en la bitácora la causa, la corrección y los archivos modificados. Muéstrame un resumen.
````

### Reanudación de un prompt interrumpido

````text
La ejecución anterior del prompt P[NN] se interrumpió. Lee doc/ESTADO_EJECUCION.md, doc/DICTAMEN.md, doc/PLAN_RENDIMIENTO.md y doc/PROMPTS_RENDIMIENTO.md (sección P[NN]). Revisa qué archivos de P[NN] ya existen y cuáles faltan, y continúa desde la primera tarea incompleta sin rehacer lo terminado. Al final ejecuta npm run build y npm test, y actualiza la bitácora.
````

### Despliegue fallido en Vercel

````text
El despliegue en Vercel falló con este registro:

[PEGAR AQUÍ EL REGISTRO DEL BUILD DE VERCEL]

Lee doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Identifica la causa (error de compilación, variable de entorno faltante en Vercel —incluida la conexión a Postgres—, o diferencia entre local y producción). Si es de código, corrígelo y verifica con npm run build. Si es una variable de entorno, dime exactamente qué NOMBRE de variable falta y en qué entornos de Vercel agregarla, sin pedir ni mostrar valores. Registra la causa y la solución en la bitácora.
````
