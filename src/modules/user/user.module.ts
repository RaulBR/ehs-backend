import { Module } from '@nestjs/common';

import { UserController } from './user.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { AuthService } from '../../auth/auth.service';
import { User, UserRole } from './user.entity';
import { UserService } from './user.service';
import { UtilsService } from 'src/services/utils.service';
import { Employee } from '../employee/employee.entity';
import { CategoryTypeRole } from '../audit-category/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Employee,CategoryTypeRole ])],
  providers: [UserService, JwtStrategy, AuthService, UtilsService ],
  controllers: [UserController]
})
export class UserModule { }
