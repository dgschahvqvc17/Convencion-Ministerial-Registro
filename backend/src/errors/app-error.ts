import { ApiErrorCode } from '../models/entities';

const MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Revise los campos marcados',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  UNAUTHORIZED: 'Inicie sesión para continuar',
  FORBIDDEN: 'No tiene permisos para realizar esta acción',
  NOT_FOUND: 'No se encontró el registro solicitado',
  DUPLICATE_NAME: 'Ya existe un registro con ese nombre en esta ubicación',
  DUPLICATE_ATTENDANCE: 'El pastor ya está registrado en este evento',
  MISSING_PARENT: 'Debe seleccionar la región o distrito superior',
  CONFLICT: 'El registro no puede eliminarse porque tiene datos asociados',
  INTERNAL_ERROR: 'Ocurrió un error inesperado. Intente nuevamente',
};

export class AppError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
    readonly details?: Readonly<Record<string, string>>,
  ) {
    super(MESSAGES[code]);
    this.name = 'AppError';
  }
}
