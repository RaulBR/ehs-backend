import { Controller, Post,  Body, Req, Get} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { PaginationObject } from 'src/models/request.model';
import { ROLE } from 'src/models/enums/role.enum';
import { Auth } from 'src/decorators/request.decorater';
import { DeleteResult } from 'typeorm';


@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService){}
   // addEmployee(employee: Employee, user: User)
   @Post()
   @Auth(ROLE.ADMIN)
    setEmployee(@Req() request: any, @Body() data: Employee): Promise<Employee> {
     return  this.employeeService.addEmployee(data, request.user);
   }

   @Get()
   @Auth(ROLE.USER)
   getMyEmployee(@Req() request: any): Promise<Employee> {
     return  this.employeeService.getMyEmployee( request.user);
   }

   
   @Post('get')
   @Auth(ROLE.ADMIN)
    getEmployee(@Body() data: PaginationObject): Promise<Employee[]> {
     return  this.employeeService.getEmployees(data);
   }
   @Post('delete')
   @Auth(ROLE.ADMIN)
    deleteEmployee( @Body() data: Employee): Promise<DeleteResult> {
     return  this.employeeService.deleteEmployee(data);
   }
}
