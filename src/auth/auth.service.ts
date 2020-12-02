import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
    constructor(private readonly loginService: UserService) {

    }
    async validateUser(payload): Promise<any> {
        const user = await this.loginService.findByPayload(payload);
        return user ? user.toResponceObject() : null;
    }

    async signPayload(payload): Promise<string> {
        return await sign({payload}, 'secret2', {
            expiresIn: '1w'
        })
    }
}