import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const archivoTemporal = '.env.vercel.local';
const archivoLocal = '.env.local';
const aviso = 'Aviso: no se pudo renovar la conexión con Vercel. El envío de correos no funcionará en local.';

try {
  if (process.platform === 'win32') {
    execFileSync(process.env.ComSpec || 'cmd.exe', [
      '/d',
      '/s',
      '/c',
      'npx vercel env pull .env.vercel.local --yes',
    ], { stdio: 'ignore', windowsHide: true });
  } else {
    execFileSync('npx', ['vercel', 'env', 'pull', '.env.vercel.local', '--yes'], {
      stdio: 'ignore',
    });
  }

  const contenidoTemporal = readFileSync(archivoTemporal, 'utf8');
  const lineaToken = contenidoTemporal
    .split(/\r?\n/)
    .find((linea) => /^\s*VERCEL_OIDC_TOKEN\s*=/.test(linea));
  if (!lineaToken) throw new Error('No se encontró el token de Vercel.');

  const valorToken = lineaToken.slice(lineaToken.indexOf('=') + 1).trim();
  if (!valorToken) throw new Error('El token de Vercel está vacío.');

  const contenidoActual = readFileSync(archivoLocal, 'utf8');
  const saltoLinea = contenidoActual.includes('\r\n') ? '\r\n' : '\n';
  const terminaEnSalto = /[\r\n]$/.test(contenidoActual);
  const lineas = contenidoActual.split(/\r?\n/);
  if (terminaEnSalto) lineas.pop();

  const indiceToken = lineas.findIndex((linea) => /^\s*VERCEL_OIDC_TOKEN\s*=/.test(linea));
  if (indiceToken === -1) {
    lineas.push(`VERCEL_OIDC_TOKEN=${valorToken}`);
  } else {
    lineas[indiceToken] = `VERCEL_OIDC_TOKEN=${valorToken}`;
  }

  writeFileSync(
    archivoLocal,
    `${lineas.join(saltoLinea)}${terminaEnSalto ? saltoLinea : ''}`,
    'utf8',
  );
} catch {
  console.warn(aviso);
} finally {
  try {
    if (existsSync(archivoTemporal)) unlinkSync(archivoTemporal);
  } catch {
    console.warn(aviso);
  }
}
