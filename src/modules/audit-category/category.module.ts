import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategoryType, CategoryTypeRole } from './category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRole } from 'src/modules/user/user.entity';
import { UtilsService } from 'src/services/utils.service';
import { Employee } from '../employee/employee.entity';
import { UserService } from '../user/user.service';
import { CategoryManagementController } from './category.management/category.management.controller';
import { CategoryManagementService } from './category.management/category.management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      CategoryType,
      UserRole,
      Employee,
       User,
       CategoryTypeRole
    ]),
  ],
  providers: [CategoryService ,UserService, UtilsService, CategoryManagementService],
  controllers: [CategoryController, CategoryManagementController]
})
export class CategoryModule {}
