export type CodigoError =
  | 'DATOS_INVALIDOS'
  | 'NO_AUTORIZADO'
  | 'JUGADOR_DUPLICADO'
  | 'JUGADOR_NO_ENCONTRADO'
  | 'TIENE_MEDICIONES'
  | 'ERROR_INTERNO';

export const MENSAJES: Record<CodigoError, string> = {
  DATOS_INVALIDOS: 'Revise los datos ingresados.',
  NO_AUTORIZADO: 'Debe iniciar sesión.',
  JUGADOR_DUPLICADO: 'Ya existe un jugador con ese código.',
  JUGADOR_NO_ENCONTRADO: 'No se encontró el jugador.',
  TIENE_MEDICIONES: 'El jugador tiene mediciones registradas y no se puede eliminar; desactívelo.',
  ERROR_INTERNO: 'Ocurrió un error inesperado. Intente de nuevo.',
};

export const ESTADO_HTTP: Record<CodigoError, number> = {
  DATOS_INVALIDOS: 400,
  NO_AUTORIZADO: 401,
  JUGADOR_DUPLICADO: 409,
  JUGADOR_NO_ENCONTRADO: 404,
  TIENE_MEDICIONES: 409,
  ERROR_INTERNO: 500,
};

export class ErrorDeNegocio extends Error {
  constructor(
    public codigo: CodigoError,
    mensaje?: string,
    public detalles?: unknown,
  ) {
    super(mensaje ?? MENSAJES[codigo]);
    this.name = 'ErrorDeNegocio';
  }
}
