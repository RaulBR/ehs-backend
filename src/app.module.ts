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
      host: env.CASH_HOST,
      port: env.CASH_PORT,
      password: env.CASH_PASSWORD
    })
  ],

  controllers: [AppController],
  providers: [AppService , CashingService],
})
export class AppModule { }
