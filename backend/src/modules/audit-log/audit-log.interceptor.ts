import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_ACTION: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

const SKIP_PATHS = ['/auth/', '/health', '/audit-logs', '/ai-engine/chat', '/mood', '/gamification/xp'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

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
    const segments = path.split('/').filter(Boolean);
    const resource = segments[0] || 'unknown';
    const lastSegment = segments[segments.length - 1];
    const resourceId = segments.length > 1 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(lastSegment)
      ? lastSegment
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
        }).catch((err) => this.logger.warn(`Audit log failed: ${err?.message}`));
      }),
    );
  }
}
