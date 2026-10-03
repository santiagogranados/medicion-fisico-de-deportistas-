# /data

Cada archivo JSON representa una colección con `_meta` y `records`. El motor local crea backups en
`_backups/` antes de escribir. En despliegues serverless, esta capa debe sustituirse por un adapter
persistente (por ejemplo, Turso o Vercel KV).

La autenticación de la aplicación usa Supabase Auth y los perfiles viven en `public.users`; no crear
cuentas de autenticación en las colecciones JSON.