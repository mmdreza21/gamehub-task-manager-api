import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

/**
 * Common Swagger decorator for GET endpoints
 */
export function CommonSwaggerGet(options?: {
  summary?: string;
  description?: string;
}) {
  return applyDecorators(
    ApiSecurity('JWT-auth'),
    ApiOperation({
      summary: options?.summary || 'GET operation',
      description: options?.description,
    }),
    ApiResponse({
      status: 200,
      description: options?.description || 'Success',
    }),
  );
}

export function CommonSwaggerGetNoAuth(options?: {
  summary?: string;
  description?: string;
}) {
  return applyDecorators(
    ApiOperation({
      summary: options?.summary || 'GET operation',
      description: options?.description,
    }),
    ApiResponse({
      status: 200,
      description: options?.description || 'Success',
    }),
  );
}

/**
 * Common Swagger decorator for POST endpoints
 */
export function CommonSwaggerPost(options?: {
  summary?: string;
  description?: string;
}) {
  return applyDecorators(
    ApiOperation({
      summary: options?.summary || 'POST operation',
      description: options?.description,
    }),
    ApiResponse({
      status: 200,
      description: options?.description || 'Success',
    }),
  );
}

/**
 * Common Swagger decorator for POST endpoints
 */
export function CommonSwaggerPostWithAuth(options?: {
  summary?: string;
  description?: string;
}) {
  return applyDecorators(
    ApiSecurity('JWT-auth'),
    ApiOperation({
      summary: options?.summary || 'POST operation',
      description: options?.description,
    }),
    ApiResponse({
      status: 200,
      description: options?.description || 'Success',
    }),
  );
}
