import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from '../user/user.entity';
import { UtilsService } from 'src/services/utils.service';
import { CategoryType, Category } from './category.entity';
import { PaginationObject } from 'src/models/request.model';

@Injectable()
export class CategoryService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(CategoryType) private readonly categoryTypeRepository: Repository<CategoryType>,
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
        private readonly connection: Connection,
        private readonly utilityService: UtilsService) { }


    async getGetCategoryTypes(data: PaginationObject) {
        try {
            const categoryes = await this.categoryTypeRepository.find({
                relations: ['categories']
            });
            return categoryes;
        } catch (e) {
            throw new HttpException({ status: 'error' }, HttpStatus.OK);
        }


    }

    async setCategoryType(categoryType: CategoryType, user: User) {
        // only users with roll admin shoud be able to add

        // check if Area is unique
        if (!categoryType || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        const userDTO = this.userRepository.create(user);
        categoryType = this.utilityService.removeNullProperty('id', categoryType);
        const categoryTypeDto = this.categoryTypeRepository.create(categoryType);



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
            return new HttpException('delete error', 200);
        }
    }

    async deleteCategoryType(categoryType: CategoryType, user: User) {
        if (!categoryType || !user) {
            throw new HttpException('Missing categoryType incorect request', HttpStatus.BAD_REQUEST);
        }
        try {
            const dataFromDb = await this.categoryTypeRepository.findOne({
                where: { id: categoryType.id },
                relations: ['categories']
            });
            if (!dataFromDb) {
                return new HttpException('no data', 200);
            }
             this.connection.transaction(async manager => {
                await manager.remove<Category>(dataFromDb.categories);
                await manager.remove<CategoryType>(dataFromDb);
            });
        } catch (e) {
            return new HttpException('delete error', 200);
        }
        return this.getGetCategoryTypes(null); 
    }

    async deleteCategory(category: Category, user: User) {
        if (!category || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.categoryRepository.delete({ id: category.id });
        } catch (e) {
            return new HttpException('delete error', 200);
        }
    }
}
