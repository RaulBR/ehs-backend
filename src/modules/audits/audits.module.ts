import { Module, CacheModule } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditHead } from './audit.entity';

import { UtilsService } from 'src/services/utils.service';
import { Aspect,  AspectPhoto } from 'src/modules/audits/audit_aspect/aspect.entity';
import { User, UserRole } from '../user/user.entity';
import { AuditGateway } from './audit.gateway';
import { UserService } from '../user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { Employee } from '../employee/employee.entity';
import { AreaService } from '../area/area.service';
import { Area, AreaStep, AreaRole } from '../area/area.entity';
import { AuditAction } from './audit_aspect/action.entity';
import { CashingService } from 'src/services/cashe.service';
import * as redisStore from 'cache-manager-redis-store';
import { AspectController } from './audit_aspect/controllers/aspect.controller';
import { AspectPhotoController } from './audit_aspect/controllers/aspect-photo.controller';
import { AspectService } from './audit_aspect/aspect.service';
import { PhotoService } from './audit_aspect/photo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,
      UserRole,
      Employee,
      AuditHead,
      Aspect,
      AuditAction,
      AspectPhoto,
      Area,
      AreaStep,
      AreaRole,
      
    ]),
    CacheModule.register({
      store: redisStore,
      host: 'ec2-54-73-148-106.eu-west-1.compute.amazonaws.com',
      port: 13239,
      password: 'p96ec900006c4779c08becd70d4af627c7e27a07bd667913fda8ac37ee58d74f8'
    })
  ],
  providers: [
    AuditsService
    , UtilsService,
    AuditGateway,
    UserService,
    AuthService,
    AreaService,
    AspectService,
    PhotoService,
    CashingService],
  controllers: [AuditsController,AspectController, AspectPhotoController]
})
export class AuditsModule { }
