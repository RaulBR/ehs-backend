import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/modules/employee/employee.entity';
import { User, UserRole } from 'src/modules/user/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { UtilsService } from 'src/services/utils.service';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { CategoryType, CategoryTypeRole } from '../category.entity';

@Injectable()
export class CategoryManagementService {

    constructor(
    
        @InjectRepository(CategoryTypeRole) private readonly categoryTypeRoleRepository: Repository<CategoryTypeRole>,
        private readonly connection: Connection,
        private readonly utilityService: UtilsService,
        private readonly userService: UserService) { }
    async getCategoryTypeRoles(): Promise<CategoryTypeRole[]> {
        try {
            return this.categoryTypeRoleRepository.find({relations:['categoryType', 'responsible']});
        }
        catch(e) {
            throw new HttpException({ status: 'retrive error' }, 200);
        }
    }
    async addCategoryManagerCategory(categoryTypeRole: CategoryTypeRole, user: User): Promise<CategoryTypeRole> {
       
        if (!categoryTypeRole || !user) {
            throw new HttpException('Missing category incorect request', HttpStatus.BAD_REQUEST);
        }
        categoryTypeRole = this.utilityService.removeNullProperty('id',categoryTypeRole);
        // TODO ADD TO TRANSACTION
        try {
            if (categoryTypeRole.responsible) {
                const responsibleUser = await this.userService.createRoleForEmployee(categoryTypeRole.responsible);
            }
            // remove role here
            categoryTypeRole.role = categoryTypeRole.categoryType.type
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
            const categoryRoles = await this._getCategoryTypeRole(category.responsible);
            return this.connection.transaction(async manager => {
                if (categoryRoles.length == 1) {
                    try {
                    await this.userService.removeRoleForEmployee(category.responsible);
                    } catch (e) {
                        console.log(e);
                    }
                }
                return await this.categoryTypeRoleRepository.delete({ id: category.id });
             });

        } catch (e) {
            throw new HttpException('delete error', 200);
        }
    }
    private async _getCategoryTypeRole(employee: Employee): Promise<CategoryTypeRole[]> {
        const employeeId = employee.id;
        const categoryTypeRoleRepository = await this.connection.getRepository<CategoryTypeRole>('CategoryTypeRole')
            .createQueryBuilder("categoryRole")
            .innerJoinAndSelect("categoryRole.responsible", "responsible")
            .where(`"responsible"."id" =:employeeId`, { employeeId })
            .getMany();
        return categoryTypeRoleRepository;
    }
}
