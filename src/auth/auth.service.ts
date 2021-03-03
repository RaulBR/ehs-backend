import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { Payload } from 'src/models/payload.model';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
    constructor(private readonly loginService: UserService) {

    }
    async validateUser(payload: Payload): Promise<any> {
        const user = await this.loginService.findByPayload(payload);
        return user;
    }

    async signPayload(payload :Payload): Promise<string> {
        return await sign({payload}, 'secret2', {
            expiresIn: '1w'
        })
    }
}