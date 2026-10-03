# /data

Cada archivo JSON representa una colección con `_meta` y `records`. El motor local crea backups en
`_backups/` antes de escribir. En despliegues serverless, esta capa debe sustituirse por un adapter
persistente (por ejemplo, Turso o Vercel KV).

La colección privada `user.json` se crea al registrar la primera cuenta y está excluida de Git porque
contiene datos de usuarios y hashes de contraseñas.