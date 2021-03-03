import { User, UserRole } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Connection } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UtilsService } from "src/services/utils.service";
import { Employee } from "../employee/employee.entity";
import { Payload } from "src/models/payload.model";
import { ROLE } from "src/models/enums/role.enum";
import { CategoryTypeRole } from "../audit-category/category.entity";

export class UserService {
 
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        private readonly connection: Connection,
        private readonly utilService: UtilsService) {}

    async findByPayload(payload: Payload): Promise<User> {
        try {
            return await (await this.getUserById(payload.id)).toResponceObject();
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
        if(!user) {
            throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED)
        }
        if (await user.compare(data.password)) {
            const regiUser = await this.userRepository.save(user);
            console.log(regiUser.toResponceObject());
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
        let isAdmin = false;
        try {
           
            const roles = [];
            let role = await this.userRoleRepository.findOne({ where: { role: 'ADMIN' }, relations: ['users'] });
    
            
            let roleDto;
            if (!role || !role.users.length) {
                isAdmin = true;  
                roleDto =  await this.createuserRoles(role);              
            } else {
                role = await this.userRoleRepository.findOne({ where: { role: 'USER' } });
                roleDto = this.userRoleRepository.create(role);
            }
            roles.push(roleDto);
             employee = await this.employeeRepository.findOne({email: data.email });
            if (employee) {
                const categoryTypeRoleRepository = await this._getCategoryTypeRole(employee);
                if(categoryTypeRoleRepository) {
                    role = await this.userRoleRepository.findOne({ where: { role: ROLE.MANAGER } });
                    roles.push(role);
                }
            }
            
            dbUser.roles = roles;
        
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
   
            if(!employee) {
                const employeeDbo = this.employeeRepository.create({
                    user:dbUser
                });
                if(!isAdmin) {
                    await this.employeeRepository.save(employeeDbo);
                }
                
            }            
            return regiUser.toResponceObject();
        } catch (e) {
            throw new HttpException('save error', HttpStatus.OK);
        }
    }

    private async _getCategoryTypeRole(employee: Employee) {
        const employeeId = employee.id;
        const categoryTypeRoleRepository = await this.connection.getRepository<CategoryTypeRole>('CategoryTypeRole')
            .createQueryBuilder("categoryRole")
            .innerJoinAndSelect("categoryRole.responsible", "responsible")
            .where(`"responsible"."id" =:employeeId`, { employeeId })
            .getOne();
        return categoryTypeRoleRepository;
    }

    private async createuserRoles(role: UserRole) {
        if (role) {
            return;
        }
            // add roles 
            let 
            roles = await this.userRoleRepository.create({
                role: ROLE.USER
            });
            await this.userRoleRepository.save(roles);
            roles = await this.userRoleRepository.create({
                role: ROLE.MANAGER
            });
            await this.userRoleRepository.save(roles);

            roles = await this.userRoleRepository.create({
                role: ROLE.ADMIN
            });
            return  await this.userRoleRepository.save(roles);

       
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
    
    // TODO not finished
    async createRoleForEmployee (employee: Employee): Promise<User> {
        try {
            if (!employee) {
                return;
            }
            const dBemployee: Employee = await this.employeeRepository.findOne({ where:employee, relations: ['user'] });
            const { user } = dBemployee;
            let dbUser = await this.userRepository.findOne({ where: user, relations: ['roles'] });
            if (!dbUser.roles) {
                return;
            }
    
            const hasManager: UserRole = dbUser.roles.find(element => element.role === ROLE.MANAGER);
            if(!hasManager){
                let role = await this.userRoleRepository.findOne({where:{role: ROLE.MANAGER}});
                if (!role) {
                    role = await this.userRoleRepository.create({
                        role: ROLE.MANAGER
                    });
                    role =  await this. userRoleRepository.save(role);
                }      
                dbUser.roles.push(role);
                dbUser = await this.userRepository.save(dbUser);
                
            }
       
            return dbUser.toResponceObject();

        }
        catch(e) {
            return;
        }
       
    }
     async removeRoleForEmployee(responsible: Employee) {
        const dBemployee: User = await this.getUserFormEmployee(responsible);
        if(!dBemployee) return;
        try {
            const userRole = await this.userRoleRepository.findOne({where:{role: ROLE.MANAGER}, relations: ['users']});
            if(userRole) {
                userRole.users = userRole.users.filter(user => user.id !== dBemployee.id);
                const dbuserRole = this.userRoleRepository.create(userRole);
                await this.userRoleRepository.save(dbuserRole);
            }
          
        }catch(e) {
            console.log(e);
        }
        

    }
   
    private async getUserFormEmployee(employee: Employee): Promise<User> {
        if (!employee) {
            return;
        }
        //const dBemployee: Employee = await this.employeeRepository.findOne({ where:{id: employee.id}, relations: ['user'] });
        const employeeId = employee.id;
        //const userdb = await this.userRepository.findOne({id:dBemployee.userId});
     ///
     const dBemployee: Employee =  await this.connection.getRepository<Employee>('Employee')
     .createQueryBuilder("employee")
     .innerJoinAndSelect("employee.user","user")
        .where(`"employee"."id" =:employeeId`, { employeeId })
     .getOne();
     //
  
        if(!dBemployee) return;
        return dBemployee.user.toResponceObject();
    }
}