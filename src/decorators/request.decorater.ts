

import { applyDecorators, UseGuards, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ROLE } from 'src/models/enums/role.enum';
import { Role } from './role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role-guard';

export function Auth(role?: ROLE): any {
    if (!role) {
        return applyDecorators(
            UseGuards(AuthGuard('jwt')),
        );
    }

    return applyDecorators(
        UseGuards(AuthGuard('jwt'), RolesGuard),
        Role(role),
    );
}


export function ValidateMapper(id?: string) : any {
    return applyDecorators(
        UsePipes(new ValidationPipe({
            exceptionFactory: (errors) => {
                const errorMessages = {
                    errors: {},
                    name: id || errors[0].target.constructor.name
                };
                errors.forEach(element => {
                    errorMessages.errors[element.property] = Object.values(element.constraints).join('. ').replace(element.property, "").trim();
                });
                return new BadRequestException(errorMessages);
            }

        }))
    );
}