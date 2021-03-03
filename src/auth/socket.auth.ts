import { ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Injectable, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';


@Injectable()
export class SocketAuth implements CanActivate {
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
            const user  = headders.user;
            if(userFormToken.email !== user) {
                return false;
            }
            request['payloaduser'] = userFormToken['payload'];
            return true;

        }
        return false;

    }

}