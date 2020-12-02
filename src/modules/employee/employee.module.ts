import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRole } from '../user/user.entity';
import { UtilsService } from 'src/services/utils.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Employee
    ]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, UtilsService ,UserService]
})
export class EmployeeModule { }
