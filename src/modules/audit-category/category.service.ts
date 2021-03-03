import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, DeleteResult } from 'typeorm';
import { User } from '../user/user.entity';
import { UtilsService } from 'src/services/utils.service';
import { CategoryType, Category, CategoryTypeRole } from './category.entity';
import { PaginationObject } from 'src/models/request.model';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoryService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(CategoryType) private readonly categoryTypeRepository: Repository<CategoryType>,
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Category) private readonly categoryTypeRoleRepository: Repository<CategoryTypeRole>,
        private readonly connection: Connection,
        private readonly utilityService: UtilsService,
        private readonly userService: UserService) { }


    async getCategoryTypes(data: PaginationObject): Promise<CategoryType[]> {
        if (data) {
            data = data;
        }
        try {
            const categoryes = await this.categoryTypeRepository.find({
                relations: ['categories', 'responsible']
            });
            return categoryes;
        } catch (e) {
            throw new HttpException({ status: 'error' }, HttpStatus.OK);
        }
    }

    async setCategoryType(categoryType: CategoryType, user: User): Promise<CategoryType> {
        // only users with roll admin shoud be able to add

        // check if Area is unique
        if (!categoryType || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        const userDTO = this.userRepository.create(user);
        categoryType = this.utilityService.removeNullProperty('id', categoryType);
        const categoryTypeDto = this.categoryTypeRepository.create(categoryType);
        // add to transaction

        const categories = [];
        if (categoryType.categories && categoryType.categories.length) {
            categoryType.categories.forEach(element => {
                element = this.utilityService.removeNullProperty('id', element);
                const steptDTO = this.categoryRepository.create(element);
                steptDTO.createdUser = userDTO;
                categories.push(steptDTO);
            });
            categoryTypeDto.categories = categories;
        }


        try {
            const result = await this.categoryTypeRepository.save(categoryTypeDto);
            return result.toResponceObject();
        } catch (e) {
            throw new HttpException({ status: 'save error' }, HttpStatus.BAD_REQUEST);
        }
    }

    async setCategory(category: Category, user: User) {
        if (!category || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        category = this.utilityService.removeNullProperty('id', category);
        const categoryRepo = this.categoryRepository.create(category);
        try {
            return await this.categoryRepository.save(categoryRepo);
        } catch (e) {
            throw new HttpException('delete error', 200);
        }
    }

    async deleteCategoryType(categoryType: CategoryType, user: User): Promise<CategoryType[]> {
        if (!categoryType || !user) {
            throw new HttpException('Missing categoryType incorect request', HttpStatus.BAD_REQUEST);
        }
        try {
            const dataFromDb = await this.categoryTypeRepository.findOne({
                where: { id: categoryType.id },
                relations: ['categories']
            });
            if (!dataFromDb) {
                throw new HttpException('no data', 200);
            }
            this.connection.transaction(async manager => {
                await manager.remove<Category>(dataFromDb.categories);
                await manager.remove<CategoryType>(dataFromDb);
            });
        } catch (e) {
            throw new HttpException('delete error', 200);
        }
        return this.getCategoryTypes(null);
    }

    async deleteCategory(category: Category, user: User): Promise<DeleteResult> {
        if (!category || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.categoryRepository.delete({ id: category.id });
        } catch (e) {
            throw new HttpException('delete error', 200);
        }
    }
    async addCategoryManagerCategory(categoryTypeRole: CategoryTypeRole, user: User): Promise<CategoryTypeRole> {

        if (!categoryTypeRole || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        // TODO ADD TO TRANSACTION
        try {
            if (categoryTypeRole.responsible) {
                const responsibleUser = await this.userService.createRoleForEmployee(categoryTypeRole.responsible);
            }
            const dbcategoryTypeRole = this.categoryTypeRoleRepository.create(categoryTypeRole);
            return await this.categoryTypeRoleRepository.save(dbcategoryTypeRole);
        } catch (e) {
            throw new HttpException({ status: 'save error' }, 200);
        }
    }



    async deleteCategoryTypeRole(category: CategoryTypeRole, user: User): Promise<DeleteResult> {
        if (!category || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        try {
            const categoryRoles = await this.categoryTypeRepository.find({ where: { responsible: category.responsible } });
             return this.connection.transaction( manager => {
                  if (categoryRoles.length <= 1) {
                 this.userService.removeRoleForEmployee(category.responsible);
            }
            return this.categoryTypeRoleRepository.delete({ id: category.id });
            });    
          

        } catch (e) {
            throw new HttpException('delete error', 200);
        }
    }
}
