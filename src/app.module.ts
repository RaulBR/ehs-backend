import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuditsModule } from './modules/audits/audits.module';
import { AreaModule } from './modules/area/area.module';
import * as redisStore from 'cache-manager-redis-store';
import { EmployeeModule } from './modules/employee/employee.module';
import { CategoryModule } from './modules/audit-category/category.module';import { CashingService } from './services/cashe.service';
;


@Module({
  imports: [
    UserModule,
    AuditsModule,
    TypeOrmModule.forRoot(),
    AreaModule,
    EmployeeModule,
    CategoryModule,

    CacheModule.register({
      store: redisStore,
      host: 'ec2-54-73-148-106.eu-west-1.compute.amazonaws.com',
      port: 13239,
      password: 'p96ec900006c4779c08becd70d4af627c7e27a07bd667913fda8ac37ee58d74f8'
    })
  ],

  controllers: [AppController],
  providers: [AppService , CashingService],
})
export class AppModule { }
