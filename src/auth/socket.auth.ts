import { ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Injectable, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CashingService } from 'src/services/cashe.service';


@Injectable()
export class SocketAuth implements CanActivate {
    constructor(private readonly authService: AuthService,
        private readonly cashingService: CashingService) { }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        if (request.handshake) {
            const headders = request.handshake.headers;
            const tokenString = headders.authorization || null;
            if (tokenString === null) {
                return false;
            }
            // add validation
            const token = tokenString.split(' ')[1];
            let userFormToken;
            try {
                userFormToken = verify(token, 'secret2');
            } catch (e) {
                return false;
            }

           return this.authService.validateUser(userFormToken['payload'] || null).then((data) => {
               // here
            //   console.log(data.email, request.id);
            this.cashingService.setValue(data.email, request.id)
                request['user'] = data;
                return true;
            }).catch(() => {
                return false;
            });
        }
        return false;

    }
}