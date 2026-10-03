# Medifis

Panel fullstack para registrar observaciones y mediciones físicas de deportistas. La primera entrega
implementa la base vertical del plan: Next.js + TypeScript estricto, persistencia JSON local, esquemas
Zod, API de salud, CRUD genérico para colecciones y una interfaz responsive para notas del equipo.

## Desarrollo

```bash
npm install
copy .env.example .env.local
npm run dev
```

Comandos de calidad:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

La aplicación se abre en `http://localhost:3000`. La salud está disponible en `/api/health` y el CRUD
de notas en `/api/data/note`.

## Acceso local

En desarrollo, abre `/register` para crear la primera cuenta. Esa cuenta obtiene el rol `admin`; las
siguientes quedan como `viewer`. El registro se deshabilita en producción. Las cuentas se guardan en
`data/user.json` y las contraseñas se almacenan como hashes bcrypt. La colección de usuarios no está
expuesta por el CRUD genérico.

Las sesiones usan una cookie httpOnly con expiración de 24 horas. En desarrollo se usa una clave local
de conveniencia; antes de desplegar, define un `AUTH_SECRET` aleatorio de al menos 32 caracteres. La
persistencia JSON actual es local y no admite escrituras en producción.

## Arquitectura

- `src/app`: App Router, página principal y endpoints.
- `src/lib/json-db.ts`: lectura, escritura atómica, backups y serialización de escrituras.
- `data`: colecciones JSON y esquemas Zod.
- `doc`: plan completo de evolución por fases.

La persistencia sobre archivos es adecuada para desarrollo local. Antes de habilitar escrituras en
producción debe añadirse el adapter persistente previsto en la Fase 4.