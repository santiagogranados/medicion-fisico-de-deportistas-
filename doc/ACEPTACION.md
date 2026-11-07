# Aceptación del MVP · Rendimiento Físico

Los casos A-01 a A-13 deben ejecutarse en el despliegue de Vercel, con la base Supabase preparada. Los
resultados y evidencias se dejan vacíos hasta ejecutar cada caso en ese entorno; no se consideran
verificados por una compilación local.

| ID | Acción | Resultado esperado | Resultado obtenido | Evidencia | Observación |
|---|---|---|---|---|---|
| A-01 | Abrir `/rendimiento` sin sesión | Redirección al login |  |  |  |
| A-02 | Registrar "Carlos Pérez" (Delantero, 32,4 km/h, 8200 m, 55 s, FC 175, 18 sprints) | Aparece con rendimiento Alto (6/6) |  |  |  |
| A-03 | Intentar otro jugador con el mismo código | Rechazo por duplicado |  |  |  |
| A-04 | Intentar registrar con edad 14 | Rechazo con mensaje |  |  |  |
| A-05 | Intentar registrar con distancia 0 o FC 230 | Rechazo con mensaje |  |  |  |
| A-06 | Registrar "Daniel Castro" (24,1 km/h, 5100 m, 115 s) | Rendimiento Bajo (2/6) |  |  |  |
| A-07 | Ver la ficha de Carlos | Velocidad ALTA, Distancia ALTA, Recuperación RÁPIDA, Puntaje 6/6, Alto |  |  |  |
| A-08 | Usar la calculadora con 30 m y 4 s | Muestra 27 km/h |  |  |  |
| A-09 | Consultar un jugador por nombre | Muestra sus datos y clasificación |  |  |  |
| A-10 | Ver alertas | Lista velocidad baja, recuperación lenta y FC de alerta, con la nota académica |  |  |  |
| A-11 | Registrar una nueva medición para un jugador | La ficha muestra la más reciente |  |  |  |
| A-12 | Filtrar por posición | La lista responde al filtro |  |  |  |
| A-13 | Cerrar el navegador y volver a entrar | Los datos persisten |  |  |  |

A-14 corresponde a la comparación opcional y se agrega cuando se ejecute P09.

## Evidencia pendiente

La conexión PostgreSQL al pooler agotó el tiempo de espera al intentar migrar y verificar la base. Por
eso no se ejecutaron los casos con persistencia, no se cargaron ni limpiaron datos demo y las columnas
de resultado/evidencia permanecen vacías. Ejecutar y documentar A-01 a A-13 después de confirmar la
conexión y desplegar en Vercel.
