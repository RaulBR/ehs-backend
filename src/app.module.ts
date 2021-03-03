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
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

;


@Module({
  imports: [
    UserModule,
    AuditsModule,
    TypeOrmModule.forRoot(),
    AreaModule,
    EmployeeModule,
    CategoryModule,
    ConfigModule.forRoot(),
  
    CacheModule.register({
      store: redisStore,
      host: process.env.CASH_HOST,
      port: parseInt(process.env.CASH_PORT,10),
      password: process.env.CASH_PASSWORD || ''
    
    }),
    // ServeStaticModule.forRoot({
    //   rootPath:  'src/email-teamplates/submited.css',
    // }),
  ],

  controllers: [AppController],
  providers: [AppService , CashingService],
})
export class AppModule { }

