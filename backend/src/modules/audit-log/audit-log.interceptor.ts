import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_ACTION: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// Paths to skip logging (noisy or auth-related)
const SKIP_PATHS = ['/auth/', '/health', '/audit-logs'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;

    if (!MUTATING_METHODS.includes(method)) {
      return next.handle();
    }

    const path: string = req.url || req.path || '';
    if (SKIP_PATHS.some((skip) => path.includes(skip))) {
      return next.handle();
    }

    const user = req.user;
    const resource = path.split('/').filter(Boolean)[0] || 'unknown';
    const segments = path.split('/').filter(Boolean);
    const resourceId = segments.length > 1 && segments[segments.length - 1].match(/^[0-9a-f-]{36}$/)
      ? segments[segments.length - 1]
      : null;

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          userId: user?.userId,
          userName: user?.name || user?.email,
          action: METHOD_ACTION[method] || method,
          resource,
          resourceId,
          method,
          path,
          tenantId: user?.tenantId,
          details: method === 'DELETE' ? `Deleted ${resource}` : undefined,
        }).catch(() => {}); // fire-and-forget
      }),
    );
  }
}
