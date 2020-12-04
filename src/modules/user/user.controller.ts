import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { User } from './user.entity';
import { UserService } from './user.service';
import {  ValidateMapper } from 'src/decorators/request.decorater';
import { AuthGuard } from '@nestjs/passport';


@Controller()
export class UserController {
    constructor(private readonly loginService: UserService,
        private readonly authService: AuthService) { }

    @Post('login')
    @ValidateMapper('User')
    async login(@Body() data: User): Promise<User> {
        const user = await this.loginService.login(data)
        if (!user) {
            return;
        }

        const token = await this.authService.signPayload(user)
        user.token = token;
        return user
    }

    @Post('register')
    @ValidateMapper('User')
    async register(@Body() data: User): Promise<User> {
        const user = await this.loginService.register(data);
        if (!user) {
            return;
        }
        const token = await this.authService.signPayload(user)
        user.token = token;
        return user
    }
   
    @Post('me')
    @UseGuards(AuthGuard('jwt'))
    async isTokenValid(@Req() request): Promise<User> {
        const user = await this.loginService.whoAmI(request.user);
        if (!user) {
            return;
        }
        return user
    }
}