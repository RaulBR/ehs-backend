import { Injectable, CanActivate, ExecutionContext,  } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/models/enums/role.enum';
import { ForbiddenException } from '@nestjs/common';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const role = this.reflector.get<string>('role', context.getHandler());
    if (role === ROLE.GUEST) {
      return true
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isAdmin = user.roles.find((element) => element.role === ROLE.ADMIN);
    if(isAdmin) {
      return true;
    }
    const here = user.roles.find((element) => element.role === role);
    if(here) {
      return true;
    }
    if (role === ROLE.USER && user) {
      return true
    }
    throw new ForbiddenException();

  }
}
