import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategoryType } from './category.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/user.entity';
import { UtilsService } from 'src/services/utils.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      CategoryType,
       User
    ]),
  ],
  providers: [CategoryService , UtilsService],
  controllers: [CategoryController]
})
export class CategoryModule {}
