# Medifis

Aplicación fullstack para el seguimiento académico del rendimiento físico de deportistas. Incluye
autenticación con Supabase, el módulo de notas del equipo y el módulo de Rendimiento Físico, construido
con Next.js, TypeScript, PostgreSQL de Supabase y una interfaz adaptable.

Las mediciones y alertas son indicadores académicos del proyecto; no constituyen diagnósticos ni
recomendaciones médicas.

## Desarrollo local

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Completa `.env.local` con las variables necesarias para Supabase Auth y PostgreSQL. El módulo de
Rendimiento Físico usa `MEDIFIS_POSTGRES_URL` con la conexión del pooler de Supabase (puerto 6543).
`SUPABASE_DB_CA_CERT` es opcional cuando se requiere indicar un certificado CA local. No compartas ni
versiones valores de conexión o claves.

Para preparar la base de datos de Rendimiento Físico, una vez configurada la conexión:

```bash
npm run db:migrar
npm run db:verificar
npm run db:demo
```

La aplicación local se abre en `http://localhost:3000`. Las rutas de rendimiento requieren iniciar
sesión. Las migraciones de Supabase Auth existentes se aplican con `npm run db:migrate:supabase`.

### Scripts principales

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run db:migrar
npm run db:verificar
npm run db:demo
npm run db:limpiar
npm run probar:flujo
```

El flujo integral y las tareas de base de datos requieren una conexión PostgreSQL disponible y las
migraciones aplicadas. El acceso a `/api/health` y el CRUD de notas se mantienen disponibles según la
configuración existente del proyecto.

### Rendimiento Físico

- Registro de jugadores con validación y medición inicial.
- Cálculo de velocidad promedio, ficha, clasificaciones, puntaje, alertas y registro de nuevas mediciones.
- Clasificaciones por umbral y panel responsive con navegación móvil.
- Puntaje general de 0 a 6 derivado de velocidad, distancia y recuperación; frecuencia cardíaca no suma.
- Las velocidades y tiempos se guardan en centésimas enteras para preservar los límites exactos de las
  reglas. La velocidad promedio se calcula como `(distancia / tiempo) × 3,6`.
- El detalle de reglas, esquema y criterios se encuentra en [doc/PLAN_RENDIMIENTO.md](./doc/PLAN_RENDIMIENTO.md).

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