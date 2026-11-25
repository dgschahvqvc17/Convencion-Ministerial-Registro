import { AppError } from '../../errors/app-error';

type QueryResult<T> = { data: T | null; error: { message: string; code?: string } | null };

export function unwrap<T>(result: QueryResult<T>): T {
  if (result.error) {
    if (result.error.code === '23505') {
      throw new AppError('DUPLICATE_NAME', 409);
    }
    console.error('[Supabase]', result.error.message);
    throw new AppError('INTERNAL_ERROR', 500);
  }
  return result.data as T;
}

export function unwrapRows<T>(result: QueryResult<T[]>): T[] {
  return unwrap(result) ?? [];
}
