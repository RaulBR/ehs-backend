import { Controller, Post, Body, Req } from '@nestjs/common';
import { PaginationObject } from 'src/models/request.model';
import { CategoryService } from './category.service';
import { CategoryType, Category } from './category.entity';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/enums/role.enum';
import { CustomRequest } from 'src/models/customRequest.model';
import { DeleteResult } from 'typeorm';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }
  @Post()
  @Auth(ROLE.ADMIN)
  setArea(@Req() request: CustomRequest, @Body() data: CategoryType): Promise<CategoryType>{
    return this.categoryService.setCategoryType(data, request.user);

  }

  @Post('/get')
  @Auth(ROLE.USER)
  getCategoryType( @Body() data: PaginationObject): Promise<CategoryType[]> {
    return this.categoryService.getCategoryTypes(data);
  }

  @Post('/delete-categoryType')
  @Auth(ROLE.ADMIN)
  deleteCategoryType(@Req() request: CustomRequest, @Body() data: CategoryType): Promise<CategoryType[]>  {
    return this.categoryService.deleteCategoryType(data, request.user);

  }

  @Post('/delete-category')
  @Auth(ROLE.ADMIN)
  deleteCategory(@Req() request: CustomRequest, @Body() data: Category): Promise<DeleteResult> {
    return this.categoryService.deleteCategory(data, request.user);

  }
}
