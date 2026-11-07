# Fase 4 · Datos y API (implementación lista, integración pendiente)

Se implementaron los tipos y el mapeo de jugadores/mediciones, operaciones de registro y consulta,
historial, cálculo de velocidad, alertas, fachada `dataService` y rutas de API protegidas para el MVP.
Las consultas usan parámetros; la conversión a centésimas se realiza en la frontera de persistencia y
las clasificaciones se derivan al leer.

Verificación registrada:

- Type-check, lint, suite de Vitest y build aprobados localmente durante la implementación.
- Las rutas protegidas se probaron sin sesión y respondieron 401.
- No se pudo ejecutar `db:demo` ni `probar:flujo`: la conexión PostgreSQL a Supabase agotó el tiempo de
  espera en P01. Por tanto, las consultas y escrituras remotas no están verificadas y P04/P05 quedan
  pendientes de integración real.
