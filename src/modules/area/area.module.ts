import { Module } from '@nestjs/common';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area, AreaStep, AreaRole } from './area.entity';

import { UtilsService } from 'src/services/utils.service';
import { User } from '../user/user.entity';
import { Employee } from '../employee/employee.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Area,
      AreaStep,
      AreaRole,
      Employee
    ]),
  ],
  controllers: [AreaController],
  providers: [AreaService, UtilsService]
})
export class AreaModule {}
