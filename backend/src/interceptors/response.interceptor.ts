import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((body: unknown) => {
        if (
          body === null ||
          body === undefined ||
          (typeof body === 'object' && ('data' in body || 'error' in body))
        ) {
          return body;
        }
        return { data: body };
      }),
    );
  }
}
