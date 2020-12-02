import { Controller, Post, Body, Req } from '@nestjs/common';
import { PaginationObject } from 'src/models/request.model';
import { CategoryService } from './category.service';
import { CategoryType, Category } from './category.entity';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/entities/role.enum';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }
  @Post()
  @Auth(ROLE.ADMIN)
  setArea(@Req() request, @Body() data: CategoryType) {
    return this.categoryService.setCategoryType(data, request.user);

  }

  @Post('/get')
  @Auth(ROLE.USER)
  getCategoryType(@Req() request, @Body() data: PaginationObject) {
    return this.categoryService.getGetCategoryTypes(data);
  }

  @Post('/delete-categoryType')
  @Auth(ROLE.ADMIN)
  deleteCategoryType(@Req() request, @Body() data: CategoryType) {
    return this.categoryService.deleteCategoryType(data, request.user);

  }

  @Post('/delete-category')
  @Auth(ROLE.ADMIN)
  deleteCategory(@Req() request, @Body() data: Category) {
    return this.categoryService.deleteCategory(data, request.user);

  }
}
