import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { resolveRole, FEMALE_ZONE_ROLES } from '../role.enum';

@Injectable()
export class FemaleZoneGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Nao autenticado');

    const role = resolveRole(user.role);

    if (!FEMALE_ZONE_ROLES.includes(role)) {
      throw new ForbiddenException(
        'Esta area e exclusiva para usuarias do EliaMov. ' +
          'Perfis de personal trainer e administradores nao tem acesso.',
      );
    }
    return true;
  }
}
