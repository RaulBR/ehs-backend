import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Employee } from './employee.entity';
import { UtilsService } from 'src/services/utils.service';
import { UserService } from '../user/user.service';
import { PaginationObject } from 'src/models/request.model';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(User) private readonly userHeadRepository: Repository<User>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        private readonly utilityService: UtilsService,
        private readonly userService: UserService) { }

    async addEmployee(employee: Employee, user: User): Promise<Employee> {
        if (!employee || !user) {
            throw new HttpException('employee', HttpStatus.BAD_REQUEST);
        }
        employee = this.utilityService.removeNullProperty("id", employee);
        const userData = await this.userService.getUserByEmail(employee.email);
       
        // if(!userData) {
        //     throw new HttpException('Incorect Email', HttpStatus.BAD_REQUEST);
        // }
        if(userData) {
            employee.user = this.userHeadRepository.create(userData); 
        }
        employee.createdUser = this.userHeadRepository.create(user);    
        const employeeDao = this.employeeRepository.create(employee);
        
        try {
           const audditSaved = await this.employeeRepository.save(employeeDao);
          return audditSaved.toResponceObject();
        }
        catch(e) {
            throw new HttpException('save error', HttpStatus.OK);
        }
       
    }

    async deleteEmployee( employee: Employee): Promise<DeleteResult> {
        if(!employee) {
            throw new HttpException('no employee', HttpStatus.OK);
        }
        try {
           return  await this.employeeRepository.delete({id: employee.id});
        } catch(e) {
            throw new HttpException('delete error', HttpStatus.OK);
        }
    
    }

    async getMyEmployee( user: User): Promise<Employee> {
        try {
            const result = await this.employeeRepository.findOne(
                { email: user.email });
            return result.toResponceObject();
        } catch (e) {
            throw new HttpException('No employee', HttpStatus.OK);
        }

    }

    async getEmployees(rows: PaginationObject): Promise<Employee[]> {
     //   const search = rows.searchQuerry || '';
        rows = this.utilityService.getRows(rows);
        try {
            const result = await this.employeeRepository.find({
                // where: [
                //     {firstName : Like('%search%')},
                //     {lastName : Like('%search%')}
                // ],
                take: rows.toRow,
                skip: rows.fromRow,
            });
            return result.map(element => element.toResponceObject());
                
            

        } catch (e) {
            throw new HttpException('Retrive faild', HttpStatus.BAD_REQUEST);
        }

    }


}
