# Rendimiento Físico · Plan técnico de implementación

> Sistema de medición y seguimiento del rendimiento físico de futbolistas · versión técnica 1.0, derivada del plan funcional entregado
> Asignatura: Lógica y Programación (SIST0200) · Universidad Sergio Arboleda, Santa Marta · Docente: Jhonatan Castro Polo
> Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase Postgres · Despliegue en Vercel
> Ejecución: GitHub Copilot en modo Agente, con los prompts de `doc/PROMPTS_RENDIMIENTO.md`

---

## Índice

0. [Cómo se usa este documento](#0-cómo-se-usa-este-documento)
1. [Punto de partida y conciliación](#1-punto-de-partida-y-conciliación)
2. [Traducción del stack del plan funcional](#2-traducción-del-stack-del-plan-funcional)
3. [Alcance](#3-alcance)
4. [Acceso](#4-acceso)
5. [Las clasificaciones y el puntaje](#5-las-clasificaciones-y-el-puntaje)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Casos de uso](#7-casos-de-uso)
8. [Los cálculos](#8-los-cálculos)
9. [Modelo de datos](#9-modelo-de-datos)
10. [Arquitectura del código](#10-arquitectura-del-código)
11. [Contratos de API](#11-contratos-de-api)
12. [Pantallas](#12-pantallas)
13. [Identidad visual](#13-identidad-visual)
14. [Números, fechas y zona horaria](#14-números-fechas-y-zona-horaria)
15. [Seguridad e integridad](#15-seguridad-e-integridad)
16. [Pruebas](#16-pruebas)
17. [Plan de ejecución](#17-plan-de-ejecución)
18. [Funcionalidades opcionales](#18-funcionalidades-opcionales)
19. [Glosario](#19-glosario)

---

## 0. Cómo se usa este documento

Este plan es el documento rector del proyecto. Copilot lo lee antes de cada tarea y los prompts remiten a sus secciones por número. Si un prompt y este plan no coinciden, prevalece el plan.

El plan funcional describe un programa de consola con `jugadores.json`. Este plan técnico conserva todas sus reglas numéricas (clasificaciones por umbral, puntaje, validaciones, con sus casos límite) y las traduce al stack del curso. El primer prompt (P00) concilia: audita qué hay montado en el repositorio y decide en cada paso si crear o adaptar.

**Nota del dominio:** el sistema es académico. Las mediciones son simuladas y las alertas son indicadores del proyecto, no diagnósticos médicos. Los textos de la interfaz lo dejan claro, como pide el plan.

| Archivo en el repositorio | Función |
|---|---|
| `doc/PLAN_RENDIMIENTO.md` | Este documento |
| `doc/PROMPTS_RENDIMIENTO.md` | Prompts en orden de ejecución |
| `doc/ESTADO_ACTUAL.md` | Radiografía del repositorio antes de empezar (lo crea P00) |
| `doc/DICTAMEN.md` | Qué existe, qué falta y qué se crea o adapta |
| `doc/ESTADO_EJECUCION.md` | Avance prompt por prompt |
| `doc/checkpoints/FASE_N_COMPLETADA.md` | Evidencia del cierre de cada fase |
| `.github/copilot-instructions.md` | Reglas permanentes que Copilot aplica en todas las conversaciones |

---

## 1. Punto de partida y conciliación

### 1.1 Lo que el proyecto necesita

- Proyecto Next.js con TypeScript, desplegado en Vercel.
- Proyecto Supabase para la base de datos.
- Un login como puerta de acceso.

P00 verifica qué hay y el dictamen marca cada pieza como existe / falta / se crea.

### 1.2 Lo que P00 verifica (y el dictamen resuelve)

| Aspecto | Qué decide |
|---|---|
| Si existe el proyecto Next.js con TypeScript y compila | Si hay base o hay que crearla |
| Si existe conexión a Postgres en `.env.local` (copiada desde Vercel) | Confirma el nombre de la variable que usará `lib/db/conexion.ts` |
| Si hay login | Si se envuelve (sin reescribir) o se agrega uno mínimo en P03 |
| Mecanismo de migraciones | Si existe se usa; si no, se crea `npm run db:migrar` |
| Versión de Tailwind | Define dónde se declaran los colores (sección 13) |
| Qué del dominio ya está construido | Para adaptarlo en vez de rehacerlo |

### 1.3 Regla sobre el login

El plan funcional es un prototipo de consola sin autenticación, para un entrenador o estudiante. En el stack del curso la aplicación queda publicada en una URL de Vercel; se usa un login como puerta única de acceso, sin roles: una persona entra y gestiona los jugadores y sus mediciones. El login no se reescribe; solo se agrega el adaptador `lib/auth/sesion.ts` (`obtenerSesion`, `exigirSesion`), la protección de `/rendimiento/*` y `/api/rendimiento/*`, y la redirección posterior al login hacia `/rendimiento`.

---

## 2. Traducción del stack del plan funcional

El plan funcional usa un programa de consola en Visual Studio Code con `jugadores.json`. Ese stack no es el del curso y el archivo de texto no persiste en Vercel (serverless, sistema de archivos efímero). La lógica no cambia; cambia dónde viven los datos y cómo se interactúa.

| Pieza del plan funcional | En este plan técnico | Motivo |
|---|---|---|
| Programa de consola con menú | Next.js (App Router) + TypeScript, interfaz web | Es el stack del curso |
| `jugadores.json` | Tablas `jugadores` y `mediciones` en Supabase Postgres | El texto no persiste en Vercel; y separar las mediciones permite el historial (opcional) |
| Reglas de clasificación en funciones | Igual, en `lib/reglas/` (funciones puras) | El plan ya basa todo en reglas numéricas; se conserva y se prueba con Vitest |
| Velocidad promedio calculada en el momento | Igual, función pura; se guarda con la medición | La fórmula no cambia |
| Un registro por jugador | Un jugador con su última medición, y un historial de mediciones | Permite consultar y, opcional, comparar en el tiempo |

Lo que **no cambia**: los datos del jugador, las cinco clasificaciones por umbral con sus casos límite, el puntaje general (0 a 6), las validaciones de datos y el carácter académico (no médico).

---

## 3. Alcance

### 3.1 Módulo mínimo (el del plan funcional)

| ID | Funcionalidad (plan funcional) | Casos de uso | Prompts |
|---|---|---|---|
| F1 | Registrar un jugador con sus mediciones | CU-01 | P04, P05, P07 |
| F2 | Calcular la velocidad promedio (distancia / tiempo → km/h) | CU-02 | P02, P04 |
| F3 | Clasificar el rendimiento (velocidad, distancia, recuperación, FC) y el puntaje general | CU-03 | P02, P04, P08 |
| F4 | Consultar los datos de un jugador y su clasificación | CU-04 | P04, P08 |
| F5 | Mostrar alertas cuando una medición esté fuera de los parámetros | CU-05 | P02, P08 |

### 3.2 Funcionalidades opcionales

| ID | Funcionalidad | Casos de uso | Prompts |
|---|---|---|---|
| F6 | Comparar las mediciones de varios jugadores | CU-06 | P09 |
| F7 | Estadísticas del equipo (promedios de velocidad y distancia) | P09 |
| F8 | Ranking de velocidad y filtros por posición | P09 |
| F9 | Historial de mediciones de cada jugador | P09 |

Se construyen solo con la fase 5 cerrada. (El modelo guarda el historial de mediciones desde el módulo mínimo; la pantalla que lo muestra es opcional.)

### 3.3 Fuera de alcance

Se mantiene la lista del plan funcional: diagnósticos médicos, predicción de lesiones, análisis con IA, conexión con relojes inteligentes o GPS en tiempo real, medición por cámaras, administración de contratos o salarios, gestión de entrenamientos completos, publicación en internet, perfiles para aficionados y cálculos médicos de rendimiento.

### 3.4 Decisiones de alcance de esta versión técnica

| Decisión | Motivo |
|---|---|
| Los datos viven en Supabase Postgres | Para que persistan en producción (el JSON no sirve en Vercel) |
| Las velocidades (km/h) se guardan en centésimas enteras; la distancia en metros enteros; los tiempos de prueba en centésimas de segundo | Las fronteras exactas (24,99 / 25 / 30) con decimales de punto flotante pueden clasificar mal; las centésimas evitan ese error (sección 8) |
| Las clasificaciones y el puntaje se calculan al leer, no se guardan | Dependen de las reglas; si cambian los umbrales, no hay datos viejos que queden mal |
| Cada registro de mediciones es una fila; el jugador muestra su medición más reciente | Permite el historial y consultar siempre lo último |
| El rendimiento general se deriva del puntaje (0 a 6) con los cortes del plan | Regla 5 |
| Un jugador no se elimina; se puede desactivar | Un jugador con mediciones debe seguir en el historial |
| Las validaciones de la regla 6 se aplican antes de guardar | Regla 6 |

---

## 4. Acceso

| Actor | Acceso | Puede hacer |
|---|---|---|
| Entrenador | Login como puerta | Registrar jugadores y mediciones, consultar, ver clasificaciones y alertas; (opcional) comparar, ver estadísticas, ranking e historial |
| Sistema | Interno | Valida entradas, calcula la velocidad promedio, clasifica y asigna el puntaje, genera las alertas |

| Ruta | Sin sesión | Con sesión |
|---|:-:|:-:|
| `/` | Redirige al login | Redirige a `/rendimiento` |
| `/rendimiento/*` | Redirige al login | Sí |
| `/api/rendimiento/*` | 401 | Sí |

---

## 5. Las clasificaciones y el puntaje

El corazón del sistema son las reglas por umbral del plan, con sus casos límite. Todas se calculan sobre la medición más reciente del jugador.

### 5.1 Clasificación de velocidad máxima (regla 1)

| Velocidad máxima | Clasificación |
|---|---|
| Menor de 25 km/h | Baja |
| De 25 a menos de 30 km/h | Media |
| 30 km/h o más | Alta |

Casos límite: 24,99 → Baja; 25 → Media; 29,99 → Media; 30 → Alta.

### 5.2 Clasificación de distancia (regla 2)

| Distancia | Clasificación |
|---|---|
| Menos de 5.000 m | Baja |
| De 5.000 a menos de 8.000 m | Media |
| 8.000 m o más | Alta |

Casos límite: 5.000 → Media; 8.000 → Alta.

### 5.3 Clasificación de recuperación (regla 3)

| Tiempo de recuperación | Clasificación |
|---|---|
| Menos de 60 s | Rápida |
| De 60 a 120 s | Normal |
| Más de 120 s | Lenta |

Casos límite: 60 → Normal; 120 → Normal; 120,01 → Lenta.

### 5.4 Clasificación de frecuencia cardíaca (regla 4)

| Frecuencia cardíaca | Clasificación |
|---|---|
| Menos de 160 ppm | Dentro del rango |
| De 160 a 180 ppm | Intensidad alta |
| Más de 180 ppm | Alerta |

Casos límite: 159 → Dentro del rango; 160 → Intensidad alta; 180 → Intensidad alta; 181 → Alerta.

### 5.5 Puntaje y rendimiento general (regla 5)

Se suman puntos de tres clasificaciones (velocidad, distancia, recuperación):

| Clasificación | Puntos |
|---|---|
| Velocidad alta / media / baja | 2 / 1 / 0 |
| Distancia alta / media / baja | 2 / 1 / 0 |
| Recuperación rápida / normal / lenta | 2 / 1 / 0 |

Rendimiento general según el total (0 a 6):

| Puntaje | Rendimiento |
|---|---|
| 5 a 6 | Alto |
| 3 a 4 | Medio |
| 0 a 2 | Bajo |

La frecuencia cardíaca no suma al puntaje: su clasificación sirve para la alerta (sección 5.4), no para el rendimiento general.

---

## 6. Reglas de negocio

| ID | Regla | Origen | Dónde se aplica |
|---|---|---|---|
| RN-01 | Velocidad promedio = (distancia / tiempo) × 3,6; en km/h | Funcionalidad 2 | `lib/reglas/calculos.ts` `velocidadPromedioKmh` |
| RN-02 | Clasificación de velocidad: < 25 baja; 25 a < 30 media; ≥ 30 alta | Regla 1 | `lib/reglas/clasificacion.ts` `clasificarVelocidad` |
| RN-03 | Clasificación de distancia: < 5000 baja; 5000 a < 8000 media; ≥ 8000 alta | Regla 2 | `clasificarDistancia` |
| RN-04 | Clasificación de recuperación: < 60 rápida; 60 a 120 normal; > 120 lenta | Regla 3 | `clasificarRecuperacion` |
| RN-05 | Clasificación de frecuencia cardíaca: < 160 rango; 160 a 180 alta; > 180 alerta | Regla 4 | `clasificarFrecuencia` |
| RN-06 | Puntaje = puntos de velocidad + distancia + recuperación (cada una 2/1/0); rendimiento: 5-6 alto, 3-4 medio, 0-2 bajo | Regla 5 | `lib/reglas/clasificacion.ts` `calcularRendimiento` |
| RN-07 | Validación: edad entre 15 y 45 años | Regla 6 | `lib/reglas/jugador.ts` `validarJugador` |
| RN-08 | Validación: distancia > 0; tiempo de prueba > 0; velocidad máxima ≥ 0 | Regla 6 | `lib/reglas/medicion.ts` `validarMedicion` |
| RN-09 | Validación: frecuencia cardíaca entre 40 y 220 ppm | Regla 6 | `validarMedicion` |
| RN-10 | Validación: sprints ≥ 0; recuperación ≥ 0 | Regla 6 | `validarMedicion` |
| RN-11 | Las alertas (velocidad baja, recuperación lenta, FC de alerta) son indicadores académicos, no diagnósticos médicos | Funcionalidad 5, sección 7 | Interfaz; textos fijos |
| RN-12 | El código del jugador es único; el nombre y la posición no pueden estar vacíos | Sección 5 | BD UNIQUE, CHECK; Zod |
| RN-13 | Las clasificaciones y el puntaje se calculan al leer, no se guardan | Sección 3.4 | `lib/reglas/`; servicio |
| RN-14 | Un jugador se consulta por código o por nombre | Funcionalidad 4 | `lib/datos/jugadores.ts` |
| RN-15 | Un jugador no se elimina; se desactiva. Las mediciones no se editan; una nueva medición se agrega al historial | Sección 3.4 | Servicio; BD `ON DELETE RESTRICT` |

### 6.1 Casos límite (del plan)

| Caso | Resultado |
|---|---|
| Velocidad 24,99 / 25 / 29,99 / 30 | Baja / Media / Media / Alta (RN-02) |
| Distancia 4999 / 5000 / 7999 / 8000 | Baja / Media / Media / Alta (RN-03) |
| Recuperación 59 / 60 / 120 / 120,01 | Rápida / Normal / Normal / Lenta (RN-04) |
| FC 159 / 160 / 180 / 181 | Rango / Alta / Alta / Alerta (RN-05) |
| Puntaje 6 (alta+alta+rápida) | Rendimiento alto |
| Puntaje 2 (baja+media+normal) | Rendimiento bajo |
| Edad 14 o 46 | Rechazo (`DATOS_INVALIDOS`) |
| Distancia 0 o negativa | Rechazo |
| Tiempo de prueba 0 o negativo | Rechazo |
| FC 39 o 221 | Rechazo |
| Velocidad promedio: 30 m en 4 s | 7,5 m/s → 27 km/h (RN-01) |

---

## 7. Casos de uso

| ID | Entrada | Precondición | Efecto | Errores posibles |
|---|---|---|---|---|
| CU-01 Registrar jugador con medición | nombre, edad, posición, código, distancia, tiempo, velocidad máxima, FC, recuperación, sprints | código no repetido; datos válidos (regla 6) | Jugador creado con su primera medición | `DATOS_INVALIDOS`, `JUGADOR_DUPLICADO` |
| CU-02 Calcular velocidad promedio | distancia, tiempo | tiempo > 0 | Velocidad en km/h | `DATOS_INVALIDOS` |
| CU-03 Clasificar y puntuar | medición | — | Clasificaciones de velocidad, distancia, recuperación y FC; puntaje y rendimiento general | — |
| CU-04 Consultar jugador | código o nombre | el jugador existe | Datos del jugador, su medición más reciente y su clasificación | `JUGADOR_NO_ENCONTRADO` |
| CU-05 Ver alertas | — | — | Jugadores con velocidad baja, recuperación lenta o FC de alerta | — |
| CU-06 Comparar jugadores (opcional) | dos o más jugadores | existen | Sus mediciones lado a lado | `JUGADOR_NO_ENCONTRADO` |
| CU-07 Registrar nueva medición de un jugador (opcional) | jugador, medición | el jugador existe; datos válidos | Medición agregada al historial; pasa a ser la más reciente | `JUGADOR_NO_ENCONTRADO`, `DATOS_INVALIDOS` |

### 7.1 Secuencia de CU-01 (registrar jugador con su medición)

```ts
export async function registrarJugador(d: DatosJugadorConMedicion): Promise<JugadorConMedicion> {
  validarJugador(d);       // RN-07 (edad), RN-12 (nombre, posición)
  validarMedicion(d);      // RN-08, RN-09, RN-10 (regla 6)
  return conTransaccion(async (tx) => {
    const jugadorId = await insertarJugador(tx, { codigo: d.codigo, nombre: d.nombre, edad: d.edad, posicion: d.posicion });  // JUGADOR_DUPLICADO
    const velProm = velocidadPromedioKmh(d.distancia, d.tiempoPrueba);   // RN-01
    await insertarMedicion(tx, { jugadorId, ...d, velocidadPromedio: velProm });
    return leerJugadorConMedicion(tx, jugadorId);   // con clasificaciones calculadas (RN-02 a RN-06)
  });
}
```

La velocidad promedio se calcula y se guarda con la medición; las clasificaciones y el puntaje se calculan al leer (RN-13).

---

## 8. Los cálculos

Para respetar las fronteras exactas del plan (24,99 vs 25, 120 vs 120,01), los valores con decimales se manejan en unidades enteras: las velocidades en **centésimas de km/h** (27,00 km/h = 2700), los tiempos de prueba en **centésimas de segundo**, la distancia y la recuperación en enteros (metros y segundos). Las comparaciones de clasificación se hacen en esas unidades enteras, así que 24,99 (2499) nunca se confunde con 25 (2500) por error de punto flotante.

```ts
// lib/reglas/calculos.ts
// Velocidad promedio en km/h a partir de distancia (m) y tiempo (s); redondeada a 2 decimales.
export function velocidadPromedioKmh(distanciaM: number, tiempoS: number): number {
  return Math.round((distanciaM / tiempoS) * 3.6 * 100) / 100;   // RN-01
}

// lib/reglas/clasificacion.ts
export type NivelVelDist = 'baja' | 'media' | 'alta';
export type NivelRecup = 'rapida' | 'normal' | 'lenta';
export type NivelFC = 'rango' | 'alta' | 'alerta';

export function clasificarVelocidad(kmh: number): NivelVelDist {    // RN-02; compara en centésimas
  const v = Math.round(kmh * 100);
  if (v < 2500) return 'baja';
  if (v < 3000) return 'media';
  return 'alta';
}
export function clasificarDistancia(metros: number): NivelVelDist { // RN-03
  if (metros < 5000) return 'baja';
  if (metros < 8000) return 'media';
  return 'alta';
}
export function clasificarRecuperacion(segundos: number): NivelRecup {  // RN-04
  if (segundos < 60) return 'rapida';
  if (segundos <= 120) return 'normal';
  return 'lenta';
}
export function clasificarFrecuencia(ppm: number): NivelFC {        // RN-05
  if (ppm < 160) return 'rango';
  if (ppm <= 180) return 'alta';
  return 'alerta';
}

const PUNTOS_VD = { alta: 2, media: 1, baja: 0 } as const;
const PUNTOS_R = { rapida: 2, normal: 1, lenta: 0 } as const;

export function calcularRendimiento(d: { velocidadMaxima: number; distancia: number; recuperacion: number }):
  { puntaje: number; rendimiento: 'alto' | 'medio' | 'bajo' } {    // RN-06
  const puntaje =
    PUNTOS_VD[clasificarVelocidad(d.velocidadMaxima)] +
    PUNTOS_VD[clasificarDistancia(d.distancia)] +
    PUNTOS_R[clasificarRecuperacion(d.recuperacion)];
  const rendimiento = puntaje >= 5 ? 'alto' : puntaje >= 3 ? 'medio' : 'bajo';
  return { puntaje, rendimiento };
}
```

Ejemplos verificables:

| Jugador | Vel. máx | Distancia | Recuperación | Clasificaciones | Puntaje | Rendimiento |
|---|---|---|---|---|---|---|
| Carlos Pérez | 32,4 | 8200 | 55 | alta, alta, rápida | 6 | Alto |
| Mateo Torres | 26,4 | 6200 | 105 | media, media, normal | 3 | Medio |
| Daniel Castro | 24,1 | 5100 | 115 | baja, media, normal | 2 | Bajo |

Velocidad promedio: 30 m en 4 s → 30/4 = 7,5 m/s → 7,5 × 3,6 = 27 km/h.

---

## 9. Modelo de datos

### 9.1 Relaciones

```text
jugadores 1 ──── N mediciones   (cada prueba una fila; la más reciente es la vigente)

v_jugadores = jugadores + su medición más reciente (para consulta y clasificación)
```

Las migraciones se guardan en `supabase/migrations/`. En este documento se nombran M1 y M2. P00 confirma la numeración.

### 9.2 M1 · Tablas

```sql
-- M1: tablas de Rendimiento Físico

CREATE TABLE IF NOT EXISTS jugadores (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      INTEGER       NOT NULL,
  nombre      VARCHAR(120)  NOT NULL,
  edad        SMALLINT      NOT NULL,
  posicion    VARCHAR(40)   NOT NULL,
  activo      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT jugadores_codigo_unico UNIQUE (codigo),                       -- RN-12
  CONSTRAINT jugadores_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT jugadores_posicion_minima CHECK (char_length(btrim(posicion)) >= 1),
  CONSTRAINT jugadores_edad_valida CHECK (edad BETWEEN 15 AND 45)          -- RN-07
);

CREATE TABLE IF NOT EXISTS mediciones (
  id                    BIGSERIAL     PRIMARY KEY,
  jugador_id            UUID          NOT NULL REFERENCES jugadores(id) ON DELETE RESTRICT,  -- RN-15
  distancia             INTEGER       NOT NULL,                 -- metros enteros
  tiempo_prueba_cent    INTEGER       NOT NULL,                 -- centésimas de segundo
  velocidad_maxima_cent INTEGER       NOT NULL,                 -- centésimas de km/h
  velocidad_promedio_cent INTEGER     NOT NULL,                 -- centésimas de km/h (RN-01)
  frecuencia_cardiaca   SMALLINT      NOT NULL,
  recuperacion          SMALLINT      NOT NULL,                 -- segundos
  sprints               SMALLINT      NOT NULL,
  fecha                 DATE          NOT NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT med_distancia_positiva  CHECK (distancia > 0),                       -- RN-08
  CONSTRAINT med_tiempo_positivo     CHECK (tiempo_prueba_cent > 0),              -- RN-08
  CONSTRAINT med_velmax_no_neg       CHECK (velocidad_maxima_cent >= 0),          -- RN-08
  CONSTRAINT med_velprom_no_neg      CHECK (velocidad_promedio_cent >= 0),
  CONSTRAINT med_fc_valida           CHECK (frecuencia_cardiaca BETWEEN 40 AND 220),  -- RN-09
  CONSTRAINT med_recuperacion_no_neg CHECK (recuperacion >= 0),                   -- RN-10
  CONSTRAINT med_sprints_no_neg      CHECK (sprints >= 0)                         -- RN-10
);
CREATE INDEX IF NOT EXISTS idx_mediciones_jugador ON mediciones (jugador_id, fecha DESC, id DESC);
```

Las velocidades y el tiempo de prueba se guardan en centésimas enteras (sección 8). La distancia, la recuperación, la frecuencia y los sprints son enteros directos.

### 9.3 M2 · Vista de jugadores y seguridad

```sql
-- M2: vista con la medición más reciente y cierre de acceso público

CREATE OR REPLACE VIEW v_jugadores
WITH (security_invoker = true) AS
SELECT
  j.*,
  m.id   AS medicion_id,
  m.distancia, m.tiempo_prueba_cent, m.velocidad_maxima_cent,
  m.velocidad_promedio_cent, m.frecuencia_cardiaca, m.recuperacion, m.sprints, m.fecha
FROM jugadores j
LEFT JOIN LATERAL (
  SELECT * FROM mediciones m
  WHERE m.jugador_id = j.id
  ORDER BY m.fecha DESC, m.id DESC
  LIMIT 1
) m ON true;

ALTER TABLE jugadores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON jugadores, mediciones FROM anon, authenticated;
REVOKE ALL ON v_jugadores FROM anon, authenticated;
```

La vista entrega la medición más reciente por jugador (`DISTINCT ON` equivalente con LATERAL). Las clasificaciones y el puntaje se calculan en el servidor con las funciones de `lib/reglas/`, no en SQL, porque dependen de las reglas (RN-13). Las tablas quedan sin políticas: todo el acceso ocurre en el servidor con la conexión directa a Postgres.

### 9.4 Traducción de errores de la base de datos

| Código Postgres | Restricción | Código de negocio |
|---|---|---|
| `23505` | `jugadores_codigo_unico` | `JUGADOR_DUPLICADO` |
| `23503` | `mediciones.jugador_id` (`ON DELETE RESTRICT`) | `TIENE_MEDICIONES` |
| `23514` | `jugadores_edad_valida` | `DATOS_INVALIDOS` (edad fuera de 15 a 45) |
| `23514` | `med_fc_valida` | `DATOS_INVALIDOS` (FC fuera de 40 a 220) |
| `23514` | cualquier otro CHECK | `DATOS_INVALIDOS` |
| Otro | | `ERROR_INTERNO` (se registra en consola, no se muestra al usuario) |

---

## 10. Arquitectura del código

### 10.1 Capas

```text
Pantallas (app/rendimiento/*) ──┐
                                ├──► Rutas API (app/api/rendimiento/*) ──► lib/dataService.ts ──► lib/datos/* ──► Postgres
Componentes (components/*) ─────┘          │                                  │
                                           └──── lib/validacion (Zod)         └──── lib/reglas/* (funciones puras)
```

- `lib/reglas/`: las clasificaciones, el cálculo de velocidad, el puntaje y las validaciones. No importan la base, ni red, ni el reloj (salvo `fechas.ts`). Se prueban con Vitest. Las clasificaciones por umbral y el puntaje son las piezas más probadas.
- `lib/datos/`: consultas SQL. Solo este directorio importa `lib/db/conexion.ts`.
- `lib/dataService.ts`: fachada única.
- Rutas API: validan con Zod, verifican sesión, llaman a `dataService`, y al devolver jugadores les agregan las clasificaciones con `lib/reglas/`.

### 10.2 Árbol de archivos nuevos

```text
.github/copilot-instructions.md
doc/ESTADO_ACTUAL.md
doc/DICTAMEN.md
doc/ESTADO_EJECUCION.md
doc/checkpoints/FASE_N_COMPLETADA.md

supabase/migrations/NNNN_rendimiento_tablas.sql
supabase/migrations/NNNN_rendimiento_vista_seguridad.sql

scripts/migrar.mjs                 (solo si no existe mecanismo de migraciones)
scripts/verificar-bd.mjs
scripts/probar-flujo.ts
scripts/limpiar-prueba.mjs
scripts/cargar-demo.ts

lib/config/rendimiento.ts
lib/reglas/errores.ts
lib/reglas/fechas.ts
lib/reglas/calculos.ts
lib/reglas/clasificacion.ts
lib/reglas/jugador.ts
lib/reglas/medicion.ts
lib/validacion/esquemas.ts
lib/db/conexion.ts
lib/auth/sesion.ts
lib/http/respuestas.ts
lib/formato.ts
lib/datos/tipos.ts
lib/datos/jugadores.ts
lib/datos/mediciones.ts
lib/datos/estadisticas.ts          (opcional)
lib/dataService.ts

tests/reglas/ayudas.ts
tests/reglas/clasificacion.test.ts
tests/reglas/calculos.test.ts
tests/reglas/jugador.test.ts
tests/reglas/medicion.test.ts
vitest.config.ts

app/page.tsx                                  (redirige a /rendimiento)
app/rendimiento/layout.tsx
app/rendimiento/page.tsx                       (lista de jugadores con su rendimiento)
app/rendimiento/jugadores/nuevo/page.tsx
app/rendimiento/jugadores/[codigo]/page.tsx    (detalle: clasificaciones, alertas, historial)
app/rendimiento/calculadora/page.tsx           (velocidad promedio, F2 suelta)
app/rendimiento/comparar/page.tsx              (opcional, F6)
app/rendimiento/equipo/page.tsx                (opcional, F7/F8)

app/api/rendimiento/sesion/route.ts
app/api/rendimiento/jugadores/route.ts
app/api/rendimiento/jugadores/[codigo]/route.ts
app/api/rendimiento/jugadores/[codigo]/mediciones/route.ts   (nueva medición; historial)
app/api/rendimiento/velocidad/route.ts         (cálculo suelto, F2)
app/api/rendimiento/alertas/route.ts
app/api/rendimiento/comparar/route.ts          (opcional, F6)
app/api/rendimiento/equipo/route.ts            (opcional, F7/F8)

components/ui/*  (Boton, Campo, Selector, Tarjeta, Insignia, Aviso, EstadoVacio)
components/rendimiento/NavegacionRendimiento.tsx
components/rendimiento/InsigniaNivel.tsx
components/rendimiento/InsigniaRendimiento.tsx
components/rendimiento/TablaJugadores.tsx
components/rendimiento/FormularioJugador.tsx
components/rendimiento/FichaJugador.tsx
components/rendimiento/PanelAlertas.tsx
components/rendimiento/Calculadora.tsx
components/rendimiento/Comparador.tsx          (opcional)
```

### 10.3 Responsabilidades y prohibiciones

| Regla de código | Motivo |
|---|---|
| Identificadores, comentarios y mensajes en español | Coherencia con el dominio |
| Las clasificaciones y el puntaje viven en `lib/reglas/` y se prueban con los casos límite | Núcleo verificable (sección 5) |
| Las velocidades y el tiempo se operan en centésimas enteras | Respeta las fronteras exactas (sección 8) |
| Las clasificaciones se calculan al leer, no se guardan | RN-13 |
| Los textos de alerta aclaran que son indicadores académicos, no diagnósticos | RN-11 |
| Solo `lib/datos/` importa `lib/db/conexion.ts` | Las rutas no escriben SQL |
| Las rutas solo importan datos desde `lib/dataService.ts` | Fachada única |
| Las rutas `/api/rendimiento/*` llaman `exigirSesion()` como primera instrucción | Sección 4 |
| `params` de rutas dinámicas se obtiene con `await params` | Next.js entrega `params` como Promise |
| No modificar archivos del login salvo la redirección indicada en P03 | Sección 1.3 |

### 10.4 Configuración

```ts
// lib/config/rendimiento.ts
export const POSICIONES = ['Portero', 'Defensa', 'Mediocampista', 'Extremo', 'Delantero'] as const;
export const EDAD_MIN = 15;
export const EDAD_MAX = 45;
export const FC_MIN = 40;
export const FC_MAX = 220;
// Umbrales de clasificación (en las unidades de cada medición)
export const VEL_MEDIA_KMH = 25;   // RN-02
export const VEL_ALTA_KMH = 30;
export const DIST_MEDIA_M = 5000;  // RN-03
export const DIST_ALTA_M = 8000;
export const RECUP_RAPIDA_S = 60;  // RN-04
export const RECUP_NORMAL_MAX_S = 120;
export const FC_INTENSA = 160;     // RN-05
export const FC_ALERTA_MAX = 180;
export const ZONA_HORARIA = 'America/Bogota';
export const LIMITE_LISTADO = 500;
```

### 10.5 Firmas de las reglas puras

```ts
// lib/reglas/errores.ts
export type CodigoError =
  | 'DATOS_INVALIDOS' | 'NO_AUTORIZADO'
  | 'JUGADOR_DUPLICADO' | 'JUGADOR_NO_ENCONTRADO'
  | 'TIENE_MEDICIONES' | 'ERROR_INTERNO';
export const MENSAJES: Record<CodigoError, string>;     // sección 11.2
export const ESTADO_HTTP: Record<CodigoError, number>;  // sección 11.2
export class ErrorDeNegocio extends Error {
  constructor(public codigo: CodigoError, mensaje?: string, public detalles?: unknown);
}

// lib/reglas/fechas.ts
export function hoyBogota(reloj?: Date): string;                 // 'YYYY-MM-DD'

// lib/reglas/calculos.ts
export function velocidadPromedioKmh(distanciaM: number, tiempoS: number): number;   // RN-01

// lib/reglas/clasificacion.ts
export type NivelVelDist = 'baja' | 'media' | 'alta';
export type NivelRecup = 'rapida' | 'normal' | 'lenta';
export type NivelFC = 'rango' | 'alta' | 'alerta';
export function clasificarVelocidad(kmh: number): NivelVelDist;     // RN-02
export function clasificarDistancia(metros: number): NivelVelDist;  // RN-03
export function clasificarRecuperacion(segundos: number): NivelRecup;  // RN-04
export function clasificarFrecuencia(ppm: number): NivelFC;         // RN-05
export function calcularRendimiento(d: { velocidadMaxima: number; distancia: number; recuperacion: number }):
  { puntaje: number; rendimiento: 'alto' | 'medio' | 'bajo' };     // RN-06

// lib/reglas/jugador.ts
export function validarJugador(d: { nombre: string; edad: number; posicion: string }): void;  // RN-07, RN-12

// lib/reglas/medicion.ts
export function validarMedicion(d: {
  distancia: number; tiempoPrueba: number; velocidadMaxima: number;
  frecuenciaCardiaca: number; recuperacion: number; sprints: number;
}): void;  // RN-08, RN-09, RN-10
```

### 10.6 Firmas de `dataService`

```ts
// Sesión
obtenerSesion(): Promise<{ email: string } | null>

// Jugadores (las clasificaciones se calculan al leer)
listarJugadores(f?: { posicion?: string; incluirInactivos?: boolean }): Promise<JugadorConRendimiento[]>
registrarJugador(d: DatosJugadorConMedicion): Promise<JugadorConRendimiento>   // CU-01
consultarJugador(codigoONombre: string | number): Promise<JugadorConRendimiento>  // CU-04; JUGADOR_NO_ENCONTRADO
desactivarJugador(codigo: number): Promise<void>

// Mediciones
registrarMedicion(codigo: number, d: DatosMedicion): Promise<JugadorConRendimiento>   // CU-07; nueva al historial
historialMediciones(codigo: number): Promise<Medicion[]>                               // F9

// Cálculo suelto y alertas
calcularVelocidad(distancia: number, tiempo: number): { ms: number; kmh: number }      // CU-02
listarAlertas(): Promise<{ velocidadBaja: Fila[]; recuperacionLenta: Fila[]; frecuenciaAlerta: Fila[] }>  // CU-05

// Opcionales
compararJugadores(codigos: number[]): Promise<JugadorConRendimiento[]>                 // F6
estadisticasEquipo(): Promise<EstadisticasEquipo>                                      // F7, F8
```

Tipos (`lib/datos/tipos.ts`): `Jugador`, `Medicion` (cantidades ya en sus unidades: km/h y segundos), `JugadorConRendimiento { jugador, medicion, clasificaciones: { velocidad, distancia, recuperacion, frecuencia }, puntaje, rendimiento }`, `DatosJugadorConMedicion`, `DatosMedicion`, `EstadisticasEquipo`.

### 10.7 Conexión y transacciones

```ts
// lib/db/conexion.ts
import { Pool, types, type PoolClient } from 'pg';

types.setTypeParser(1082, (v) => v);                 // DATE → 'YYYY-MM-DD'
types.setTypeParser(1114, (v) => v);                 // TIMESTAMP → texto
types.setTypeParser(1184, (v) => v);                 // TIMESTAMPTZ → texto
types.setTypeParser(20, (v) => parseInt(v, 10));     // BIGINT (ids, COUNT) → number

const globalParaPool = globalThis as unknown as { poolRendimiento?: Pool };

export const pool = globalParaPool.poolRendimiento ?? new Pool({
  connectionString: process.env.DATABASE_URL,        // el nombre real lo confirma P00
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10_000,
});
if (process.env.NODE_ENV !== 'production') globalParaPool.poolRendimiento = pool;

export async function consultar<T>(sql: string, valores: unknown[] = []): Promise<T[]> { /* pool.query */ }
export async function conTransaccion<T>(trabajo: (tx: PoolClient) => Promise<T>): Promise<T> { /* BEGIN/COMMIT/ROLLBACK */ }
```

Las velocidades y el tiempo se guardan como `INTEGER` en centésimas, así que no hace falta parser para `NUMERIC`; la conversión a decimal se hace en el código.

---

## 11. Contratos de API

### 11.1 Formato de respuesta

```json
{ "ok": true, "datos": { } }
```

```json
{ "ok": false, "error": { "codigo": "DATOS_INVALIDOS", "mensaje": "La edad debe estar entre 15 y 45 años.", "detalles": null } }
```

Todas las respuestas llevan `Cache-Control: no-store`.

### 11.2 Códigos de error

| Código | HTTP | Mensaje para el usuario |
|---|---|---|
| `DATOS_INVALIDOS` | 400 | Revise los datos ingresados. |
| `NO_AUTORIZADO` | 401 | Debe iniciar sesión. |
| `JUGADOR_DUPLICADO` | 409 | Ya existe un jugador con ese código. |
| `JUGADOR_NO_ENCONTRADO` | 404 | No se encontró el jugador. |
| `TIENE_MEDICIONES` | 409 | El jugador tiene mediciones registradas y no se puede eliminar; desactívelo. |
| `ERROR_INTERNO` | 500 | Ocurrió un error inesperado. Intente de nuevo. |

### 11.3 Endpoints (todos requieren sesión)

| Método y ruta | Cuerpo o parámetros | Respuesta `datos` |
|---|---|---|
| `GET /api/rendimiento/sesion` | | `{ email }` |
| `GET /api/rendimiento/jugadores?posicion=&incluirInactivos=` | | `JugadorConRendimiento[]` |
| `POST /api/rendimiento/jugadores` | `{ codigo, nombre, edad, posicion, distancia, tiempoPrueba, velocidadMaxima, frecuenciaCardiaca, recuperacion, sprints }` | `JugadorConRendimiento` (201) |
| `GET /api/rendimiento/jugadores/[codigo]` | | `JugadorConRendimiento` |
| `POST /api/rendimiento/jugadores/[codigo]/mediciones` | `{ distancia, tiempoPrueba, velocidadMaxima, frecuenciaCardiaca, recuperacion, sprints }` | `JugadorConRendimiento` (201) |
| `GET /api/rendimiento/jugadores/[codigo]/mediciones` | | `Medicion[]` (F9) |
| `POST /api/rendimiento/velocidad` | `{ distancia, tiempo }` | `{ ms, kmh }` |
| `GET /api/rendimiento/alertas` | | `{ velocidadBaja, recuperacionLenta, frecuenciaAlerta }` |
| `POST /api/rendimiento/comparar` | `{ codigos: number[] }` | `JugadorConRendimiento[]` (opcional, F6) |
| `GET /api/rendimiento/equipo` | | `EstadisticasEquipo` (opcional, F7/F8) |

Las velocidades entran y salen en km/h (decimal) y los tiempos en segundos; la conversión a centésimas la hace la capa de datos.

### 11.4 Esquemas Zod (`lib/validacion/esquemas.ts`)

| Esquema | Reglas |
|---|---|
| `esquemaJugador` | codigo entero ≥ 1, nombre (1 a 120), edad entero, posicion (1 a 40) |
| `esquemaMedicion` | distancia > 0, tiempoPrueba > 0, velocidadMaxima ≥ 0, frecuenciaCardiaca entero, recuperacion entero ≥ 0, sprints entero ≥ 0 |
| `esquemaJugadorConMedicion` | combina los dos anteriores |
| `esquemaVelocidad` | distancia > 0, tiempo > 0 |
| `esquemaComparar` | codigos: arreglo de 2 o más enteros |
| `esquemaFiltros` | posicion, incluirInactivos opcionales |

Los rangos exactos (edad 15 a 45, FC 40 a 220) los verifica `lib/reglas/` para dar el mensaje correcto, y los refuerza la base con CHECK.

---

## 12. Pantallas

| Ruta | Contenido |
|---|---|
| `/` | Redirige a `/rendimiento`. |
| Layout `/rendimiento` | Verifica la sesión; sin sesión redirige al login. Barra con "Rendimiento Físico", navegación (Jugadores, Alertas, Calculadora; Comparar y Equipo cuando estén activos) y cerrar sesión. Un aviso discreto una vez: "Datos simulados con fines académicos; las alertas no son diagnósticos médicos." |
| `/rendimiento` · Jugadores | `TablaJugadores`: código, nombre, posición, velocidad máxima, distancia, recuperación, y el rendimiento general (`InsigniaRendimiento`: Alto verde, Medio ámbar, Bajo rojo). Filtro por posición. Botón "Registrar jugador". `EstadoVacio` si no hay. |
| `/rendimiento/jugadores/nuevo` · Registrar jugador | `FormularioJugador`: nombre, edad, posición (selector), código, y las mediciones (distancia, tiempo de prueba, velocidad máxima, FC, recuperación, sprints). Validación en vivo con las reglas; los rechazos de la regla 6 muestran su mensaje. Muestra en vivo la velocidad promedio calculada y las clasificaciones. |
| `/rendimiento/jugadores/[codigo]` · Ficha | Datos del jugador y su medición más reciente. `FichaJugador` con las cuatro clasificaciones (velocidad, distancia, recuperación con `InsigniaNivel`; FC con su nivel y, si es alerta, `PanelAlertas`), el puntaje (x/6) y el rendimiento general, tal como el ejemplo del plan. Botón "Nueva medición". Historial de mediciones (opcional). |
| `/rendimiento/calculadora` · Velocidad | `Calculadora`: distancia y tiempo; muestra m/s y km/h (funcionalidad 2 como herramienta suelta). |
| `/rendimiento/alertas` · Alertas | Jugadores con velocidad baja, recuperación lenta o FC de alerta, con la aclaración académica. |
| `/rendimiento/comparar` · Comparar (opcional) | Selección de dos o más jugadores y sus mediciones lado a lado. |
| `/rendimiento/equipo` · Equipo (opcional) | Promedios de velocidad y distancia, ranking de velocidad, filtros por posición. |

### 12.1 Textos fijos

Aviso académico (en el layout y en las alertas):

> Datos simulados con fines académicos. Las clasificaciones y alertas son indicadores del proyecto, no diagnósticos médicos.

Ficha (ejemplo del plan):

> Velocidad: ALTA · Distancia: ALTA · Recuperación: RÁPIDA · Puntaje: 6/6 · Rendimiento general: ALTO

---

## 13. Identidad visual

| Token | Valor | Uso |
|---|---|---|
| `--color-primario` | `#1E7A46` | Verde cancha: botones principales, barra superior |
| `--color-primario-suave` | `#E3F1E8` | Fondos de selección, hover |
| `--color-alto` | `#2F7D4F` | Rendimiento alto, nivel alto, recuperación rápida |
| `--color-medio` | `#B7791F` | Rendimiento medio, nivel medio, recuperación normal |
| `--color-bajo` | `#B83232` | Rendimiento bajo, nivel bajo, alerta de FC |
| `--color-fondo` | `#F5F8F6` | Fondo de página |
| `--color-superficie` | `#FFFFFF` | Tarjetas, tablas |
| `--color-texto` | `#1F2933` | Texto principal |
| `--color-texto-suave` | `#52606D` | Texto secundario |
| `--color-borde` | `#D9E2DC` | Bordes y divisores |

Los tokens se agregan a `app/globals.css` sin borrar estilos existentes. Con Tailwind 4 se declaran en `@theme`; con Tailwind 3, en `tailwind.config`.

Criterios: las clasificaciones y el rendimiento con color y texto (nunca solo color); las velocidades en km/h con un decimal y la distancia en metros con separador de miles; el puntaje como "x/6"; el aviso académico siempre presente; sin emojis; tablas en tarjetas apiladas bajo 640 px.

---

## 14. Números, fechas y zona horaria

| Regla | Implementación |
|---|---|
| Velocidades (km/h) | Guardadas en centésimas enteras; se muestran con uno o dos decimales; las comparaciones de clasificación usan las centésimas (sección 8) |
| Distancia, recuperación, FC, sprints, edad | Enteros |
| Tiempo de prueba | Guardado en centésimas de segundo; se muestra en segundos |
| "Hoy" (fecha de la medición) | Con `hoyBogota()` |
| Fechas | Texto `YYYY-MM-DD` |
| Lectura desde BD | Parsers de `pg` devuelven texto para fechas (sección 10.7) |

El cálculo del rendimiento no depende de la fecha; la fecha solo marca cuándo se tomó la medición (para el historial y para elegir la más reciente).

---

## 15. Seguridad e integridad

| Medida | Detalle |
|---|---|
| Acceso solo con sesión | Login como puerta y `exigirSesion()` en cada ruta de `/api/rendimiento` |
| Base de datos cerrada al público | RLS activo sin políticas y permisos revocados a `anon` y `authenticated` |
| Clasificaciones siempre vigentes | Se calculan al leer; no hay un campo guardado que quede mal si cambian los umbrales |
| Precisión de las fronteras | Velocidades y tiempo en centésimas enteras: 24,99 nunca se confunde con 25 |
| Validaciones en tres puntos | Formulario (Zod y reglas), API (Zod y reglas) y base (CHECK) con los rangos de la regla 6 |
| Datos inmutables | Las mediciones no se editan; una nueva se agrega al historial; un jugador se desactiva, no se elimina |
| Carácter académico | Los textos aclaran que las alertas no son diagnósticos médicos (RN-11) |
| SQL parametrizado | Ningún valor se concatena |
| Errores internos | Se registran con `console.error`; el usuario recibe `ERROR_INTERNO` sin detalles técnicos |

---

## 16. Pruebas

### 16.1 Pruebas unitarias de reglas (Vitest)

Las clasificaciones por umbral con sus casos límite son el centro; se prueban a fondo.

| ID | Función | Entrada | Resultado esperado |
|---|---|---|---|
| T-01 | `velocidadPromedioKmh` | 30, 4 | 27 |
| T-02 | `velocidadPromedioKmh` | 100, 10 | 36 |
| T-03 | `clasificarVelocidad` | 24.99 | baja |
| T-04 | `clasificarVelocidad` | 25 | media |
| T-05 | `clasificarVelocidad` | 29.99 | media |
| T-06 | `clasificarVelocidad` | 30 | alta |
| T-07 | `clasificarDistancia` | 4999 | baja |
| T-08 | `clasificarDistancia` | 5000 | media |
| T-09 | `clasificarDistancia` | 7999 | media |
| T-10 | `clasificarDistancia` | 8000 | alta |
| T-11 | `clasificarRecuperacion` | 59 | rapida |
| T-12 | `clasificarRecuperacion` | 60 | normal |
| T-13 | `clasificarRecuperacion` | 120 | normal |
| T-14 | `clasificarRecuperacion` | 120.01 | lenta |
| T-15 | `clasificarFrecuencia` | 159 | rango |
| T-16 | `clasificarFrecuencia` | 160 | alta |
| T-17 | `clasificarFrecuencia` | 180 | alta |
| T-18 | `clasificarFrecuencia` | 181 | alerta |
| T-19 | `calcularRendimiento` | vel 32.4, dist 8200, recup 55 | puntaje 6, alto |
| T-20 | `calcularRendimiento` | vel 26.4, dist 6200, recup 105 | puntaje 3, medio |
| T-21 | `calcularRendimiento` | vel 24.1, dist 5100, recup 115 | puntaje 2, bajo |
| T-22 | `calcularRendimiento` | vel 30, dist 8000, recup 60 | puntaje 5 (alta 2 + alta 2 + normal 1) → alto |
| T-23 | `validarJugador` | edad 14 | `DATOS_INVALIDOS` |
| T-24 | `validarJugador` | edad 46 | `DATOS_INVALIDOS` |
| T-25 | `validarJugador` | edad 15 y 45 | sin error (bordes válidos) |
| T-26 | `validarJugador` | nombre " " | `DATOS_INVALIDOS` |
| T-27 | `validarMedicion` | distancia 0 | `DATOS_INVALIDOS` |
| T-28 | `validarMedicion` | tiempoPrueba 0 | `DATOS_INVALIDOS` |
| T-29 | `validarMedicion` | velocidadMaxima -1 | `DATOS_INVALIDOS` |
| T-30 | `validarMedicion` | frecuenciaCardiaca 39 | `DATOS_INVALIDOS` |
| T-31 | `validarMedicion` | frecuenciaCardiaca 221 | `DATOS_INVALIDOS` |
| T-32 | `validarMedicion` | sprints -1 | `DATOS_INVALIDOS` |
| T-33 | `validarMedicion` | datos válidos (FC 40 y 220 en los bordes) | sin error |

Comando: `npm test`. Las 33 pruebas deben pasar antes de continuar con la fase 3.

### 16.2 Prueba de flujo contra la base de datos

`scripts/probar-flujo.ts` (`npm run probar:flujo`) usa `dataService` con códigos de prueba (900+). Imprime `OK` o `FALLA` por paso y limpia al final.

| Paso | Operación | Esperado |
|---|---|---|
| 1 | Registrar jugador código 901 "Prueba Carlos" (del plan: 32.4, 8200, 55, FC 175, 18 sprints) | Creado; clasificación alta/alta/rápida, puntaje 6, alto |
| 2 | Registrar código 901 otra vez | `JUGADOR_DUPLICADO` |
| 3 | Registrar con edad 14 | `DATOS_INVALIDOS` |
| 4 | Registrar con distancia 0 | `DATOS_INVALIDOS` |
| 5 | Registrar con FC 230 | `DATOS_INVALIDOS` |
| 6 | Registrar "Prueba Daniel" (24.1, 5100, 115) | Creado; baja/media/normal, puntaje 2, bajo |
| 7 | Consultar por código 901 | Datos de Carlos con su clasificación |
| 8 | Consultar por nombre "Prueba Daniel" | Datos de Daniel |
| 9 | Consultar un código inexistente | `JUGADOR_NO_ENCONTRADO` |
| 10 | Calcular velocidad 30 m / 4 s | 7.5 m/s, 27 km/h |
| 11 | Registrar una nueva medición para Carlos (otra fecha) | Se agrega al historial; la consulta muestra la más reciente |
| 12 | Ver alertas | Daniel aparece en velocidad baja; quien tenga FC > 180, en alerta |

### 16.3 Aceptación (criterio de terminado)

Se ejecuta en el despliegue de Vercel y se documenta en `doc/ACEPTACION.md`.

| ID | Acción | Resultado esperado |
|---|---|---|
| A-01 | Abrir `/rendimiento` sin sesión | Redirección al login |
| A-02 | Registrar "Carlos Pérez" (Delantero, 32,4 km/h, 8200 m, 55 s, FC 175, 18 sprints) | Aparece con rendimiento Alto (6/6) |
| A-03 | Intentar otro jugador con el mismo código | Rechazo por duplicado |
| A-04 | Intentar registrar con edad 14 | Rechazo con mensaje |
| A-05 | Intentar registrar con distancia 0 o FC 230 | Rechazo con mensaje |
| A-06 | Registrar "Daniel Castro" (24,1 km/h, 5100 m, 115 s) | Rendimiento Bajo (2/6) |
| A-07 | Ver la ficha de Carlos | Velocidad ALTA, Distancia ALTA, Recuperación RÁPIDA, Puntaje 6/6, Alto |
| A-08 | Usar la calculadora con 30 m y 4 s | Muestra 27 km/h |
| A-09 | Consultar un jugador por nombre | Muestra sus datos y clasificación |
| A-10 | Ver las alertas | Lista velocidad baja, recuperación lenta y FC de alerta, con la nota académica |
| A-11 | Registrar una nueva medición para un jugador | La ficha muestra la más reciente |
| A-12 | Filtrar por posición | La lista responde al filtro |
| A-13 | Cerrar el navegador y volver a entrar | Los datos persisten |
| A-14 | (Opcional) Comparar dos jugadores | Muestra sus mediciones lado a lado |

A-14 corresponde a las opcionales; se verifica tras P09.

---

## 17. Plan de ejecución

| Fase | Prompt | Resultado | Cierre |
|---|---|---|---|
| 0 · Conciliación | P00 | `ESTADO_ACTUAL.md`, `DICTAMEN.md`, `copilot-instructions.md`, `ESTADO_EJECUCION.md`; estado de compilación | `FASE_0_COMPLETADA.md` |
| 1 · Base de datos | P01 | M1 y M2 aplicadas; `npm run db:verificar` sin fallas | `FASE_1_COMPLETADA.md` |
| 2 · Reglas | P02 | `lib/config`, `lib/reglas` (clasificaciones y puntaje), 33 pruebas en verde | `FASE_2_COMPLETADA.md` |
| 3 · Servidor | P03 | Conexión, sesión, respuestas, esquemas, formato; sesión protegida | `FASE_3_COMPLETADA.md` |
| 4 · Datos y API | P04, P05 | `lib/datos/*`, `dataService`, rutas; `npm run probar:flujo` sin fallas | `FASE_4_COMPLETADA.md` |
| 5 · Interfaz | P06, P07, P08 | Componentes base, lista de jugadores, registro, ficha, calculadora, alertas | `FASE_5_COMPLETADA.md` |
| 6 · Aceptación | (en P08) | `ACEPTACION.md` con A-01 a A-13; README | `FASE_6_COMPLETADA.md` |
| 7 · Opcionales | P09 | Comparar, estadísticas del equipo, ranking, historial | `FASE_7_COMPLETADA.md` |

Condiciones entre fases: no se inicia una fase sin el archivo de cierre de la anterior; `npm run build` sin errores al final de cada prompt; `npm test` en verde desde P02; cada prompt termina con commit y push, y un fallo de despliegue en Vercel se corrige antes del siguiente prompt.

---

## 18. Funcionalidades opcionales

Se construyen solo con la fase 6 cerrada.

| Prompt | Funcionalidad | Implementación |
|---|---|---|
| P09 | F6 · Comparar jugadores | `compararJugadores(codigos)`: dos o más jugadores con sus mediciones y clasificaciones lado a lado. Ruta `/api/rendimiento/comparar`; pantalla `/rendimiento/comparar` |
| P09 | F7 · Estadísticas del equipo | `estadisticasEquipo()`: promedio de velocidad y de distancia del equipo (sobre la medición más reciente de cada jugador activo). Pantalla `/rendimiento/equipo` |
| P09 | F8 · Ranking y filtros | En `/rendimiento/equipo`, ranking por velocidad máxima y filtros por posición |
| P09 | F9 · Historial de mediciones | `historialMediciones(codigo)`: todas las mediciones de un jugador, de la más reciente a la más antigua; se muestra en su ficha |

---

## 19. Glosario

| Término | Definición |
|---|---|
| Jugador | Un futbolista con sus datos y sus mediciones |
| Medición | Un registro de una prueba física: distancia, tiempo, velocidad, FC, recuperación, sprints |
| Velocidad promedio | Distancia dividida por el tiempo, en km/h |
| Clasificación | Nivel de una medición según los umbrales (velocidad, distancia, recuperación, FC) |
| Puntaje | Suma de los puntos de velocidad, distancia y recuperación (0 a 6) |
| Rendimiento general | Alto, medio o bajo según el puntaje |
| Alerta | Indicador académico cuando una medición está fuera de los parámetros (no es diagnóstico médico) |
| Centésimas | Unidad entera interna para velocidades y tiempo, para respetar las fronteras exactas |
| Regla pura | Función de `lib/reglas/` que solo depende de sus parámetros |
| Copilot en modo Agente | Modo de GitHub Copilot Chat que lee el repositorio, edita varios archivos y ejecuta comandos de terminal con aprobación |
