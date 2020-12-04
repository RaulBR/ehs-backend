import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';


import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/models/enums/role.enum';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

  //  const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const role = this.reflector.get<string>('role', context.getHandler());
    if (role === ROLE.GUEST) {
      return true
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
  
    if(user.role === ROLE.ADMIN) {
      return true

    }
    if(user.role === ROLE.USER && role == ROLE.USER) {
      return true;
    }
    throw new ForbiddenException();

  }
}
