import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Auth } from 'src/decorators/request.decorater';
import { CustomRequest } from 'src/models/customRequest.model';
import { ROLE } from 'src/models/enums/role.enum';
import { DeleteResult } from 'typeorm';
import { CategoryType, CategoryTypeRole } from '../category.entity';
import { CategoryManagementService } from './category.management.service';

@Controller('categoryManagement')
export class CategoryManagementController {
    constructor(private readonly categoryManagmentService: CategoryManagementService) {

    }
    @Post()
    @Auth(ROLE.ADMIN)
    setCategoryManager(@Req() request: CustomRequest, @Body() data: CategoryTypeRole): Promise<CategoryTypeRole> {
     return this.categoryManagmentService.addCategoryManagerCategory(data, request.user);
  
    }
    @Post('delete')
    @Auth(ROLE.ADMIN)
    deleteCategoryManager(@Req() request: CustomRequest, @Body() data: CategoryTypeRole): Promise<DeleteResult> {
     return this.categoryManagmentService.deleteCategoryTypeRole(data, request.user);
  
    }
    @Get()
    @Auth(ROLE.ADMIN)
    getCategoryManager(@Req() request: CustomRequest, @Body() data: CategoryTypeRole):Promise<CategoryTypeRole[]> {
     return this.categoryManagmentService.getCategoryTypeRoles();
  
    }
}
