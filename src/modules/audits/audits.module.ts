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
import { EhsMailerService } from 'src/services/ehs-mailer/ehs-mailer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
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

    MailerModule.forRoot({
      transport:{
        host: 'smtp.mailgun.org',
        port:587,
        secure: false, // true for 465, false for other ports
        logger: true,
        debug: false,
        secureConnection: false,
        auth: {
            user: 'postmaster@sandbox472dc0527a3c4ce4ae0c751c31aa3c50.mailgun.org', // generated ethereal user
            pass: 'bc2501318f55e5ac6e9d66d2962d7a89-4de08e90-6ed59c82', // generated ethereal password
        },
        tls:{
            rejectUnAuthorized:true
        }
    },
    template: {
      dir: 'src/email-teamplates',
      adapter: new EjsAdapter(),
      options: {
        strict: true,
      },
    },
      defaults: {
        from: '"No Reply" <{{no-reply@localhost>',
      },
      preview: true,
     
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.CASH_HOST,
      port: parseInt(process.env.CASH_PORT, 10),
      password: process.env.CASH_PASSWORD || ''
    
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
    EhsMailerService,
    CashingService],
  controllers: [AuditsController,AspectController, AspectPhotoController]
})
export class AuditsModule { }
