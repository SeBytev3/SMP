import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Global Error Handling Middleware
 * Catch-all for all errors thrown in the application.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('🔴 Error Details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code,
  });

  // Default error
  let statusCode = err.status || 500;
  let response = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ha ocurrido un error inesperado',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    },
  };

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    response = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación en los datos de entrada',
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        })) as any,
      },
    };
  }

  // Handle Prisma Specific Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      statusCode = 409;
      response = {
        error: {
          code: 'CONFLICT',
          message: 'Ya existe un registro con esta información',
          details: `Field: ${err.meta?.target}` as any,
        },
      };
    }
    // Record not found
    if (err.code === 'P2025') {
      statusCode = 404;
      response = {
        error: {
          code: 'NOT_FOUND',
          message: 'El registro solicitado no fue encontrado',
        },
      };
    }
  }

  // Handle known application errors
  if (err.message === 'Email already registered') {
    statusCode = 400;
    response.error = {
      code: 'BAD_REQUEST',
      message: 'El correo electrónico ya está registrado',
    };
  }

  if (err.message === 'Invalid email or password') {
    statusCode = 401;
    response.error = {
      code: 'UNAUTHORIZED',
      message: 'Correo electrónico o contraseña incorrectos',
    };
  }

  if (err.message === 'Account is temporarily locked. Please try again later.') {
    statusCode = 403;
    response.error = {
      code: 'FORBIDDEN',
      message: 'Cuenta bloqueada temporalmente por intentos fallidos. Intente de nuevo más tarde.',
    };
  }

  const errorMap: Record<string, string> = {
    'Review already exists for this request': 'Ya existe una reseña para esta solicitud',
    'Cannot send requests to this provider': 'No se pueden enviar solicitudes a este proveedor',
    'Provider is already approved': 'El proveedor ya está aprobado',
    'Can only review completed requests': 'Solo se pueden calificar solicitudes completadas',
    'Can only complete accepted requests': 'Solo se pueden completar solicitudes aceptadas',
    'Only the customer can submit a review': 'Solo el cliente puede enviar una reseña',
    'Not authorized to respond to this request': 'No autorizado para responder a esta solicitud',
    'Request already has a response': 'La solicitud ya tiene una respuesta',
    'Provider is already deactivated': 'El proveedor ya está desactivado',
  };

  if (errorMap[err.message]) {
    statusCode = 400;
    response.error = {
      code: 'BAD_REQUEST',
      message: errorMap[err.message],
    };
  }

  res.status(statusCode).json(response);
};
