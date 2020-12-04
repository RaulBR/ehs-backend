import { User, UserRole } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UtilsService } from "src/services/utils.service";
import { Employee } from "../employee/employee.entity";
import { Payload } from "src/models/payload.model";

export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        private readonly utilService: UtilsService) { }

    async findByPayload(payload: Payload): Promise<User> {
        try {
            return await this.getUserById(payload.id);
        } catch (e) {

        }
        // throw new Error("Method not implemented.");
    }
    async whoAmI(user: User): Promise<User> {
        try {
            const userDao = await this.getUserById(user.id);
            if (!userDao) {
                throw new HttpException('Unothorized', HttpStatus.UNAUTHORIZED);
            }
            return userDao.toResponceObject();
        } catch (e) {
            throw new HttpException('Unothorized', HttpStatus.UNAUTHORIZED);
        }

    }

    async login(data: User): Promise<User> {
        if (!data) {
            return
        }
        const user = await this.userRepository.findOne({ email: data.email }, { relations: ['roles'] });
        if (await user.compare(data.password)) {
            const regiUser = await this.userRepository.save(user)
            return regiUser.toResponceObject();
        }
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)

    }

    async register(data: User): Promise<User> {
        if (!data) {
            throw new HttpException('no data', HttpStatus.OK);
        }
 
           const user = await this.getUserByEmail(data.email);
        if (user) {
            throw new HttpException('user exists', HttpStatus.OK);
        }
        data = this.utilService.removeNullProperty('id', data);
        const dbUser = this.userRepository.create(data);
        let employee: Employee;
        
        try {
            let isAdmin: boolean;
            const roles = [];
            let role = await this.userRoleRepository.findOne({ where: { role: 'ADMIN' }, relations: ['users'] });
            
            if(!role){
                // add roles 
                let roles = await this.userRoleRepository.create({
                    role: 'ADMIN'
                });
                await this. userRoleRepository.save(roles);
                roles = await this.userRoleRepository.create({
                    role: 'USER'
                });
                await this. userRoleRepository.save(roles);
                role = await this.userRoleRepository.findOne({ where: { role: 'ADMIN' }, relations: ['users'] });
            }

            if (!role || !role.users.length) {
                isAdmin = true;                
            } else {
                role = await this.userRoleRepository.findOne({ where: { role: 'USER' } });
            }
            const roleDto = this.userRoleRepository.create(role);
            roles.push(roleDto);
            dbUser.roles = roles;

            employee = await this.employeeRepository.findOne({email: data.email });
            if (!employee && !isAdmin) {
                throw new HttpException('Not registered yet', HttpStatus.OK); 
            }

        } catch (e) {
            if (!employee) {
                throw new HttpException('Not registered yet', HttpStatus.OK); 
            }
            throw new HttpException('Cannot figer out roles', HttpStatus.OK);
        }

        try {
            const regiUser = await this.userRepository.save(dbUser);
            const employeeDbo = this.employeeRepository.create(employee);
            employee.user = dbUser;
            await this.employeeRepository.save(employeeDbo);
            return regiUser.toResponceObject();
        } catch (e) {
            throw new HttpException('save error', HttpStatus.OK);
        }
    }

    async getUserByEmail(email): Promise<User> {
        if (!email) {
            return;
        }
        try {
            const user = await this.userRepository.findOne({ email: email });
            return user;
        } catch (e) {
            return;
        }

    }

    private async getUserById(id: string) {
        return await this.userRepository.findOne({ id: id }, { relations: ['roles'] });
    }
}