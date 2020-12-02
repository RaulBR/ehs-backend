import { Controller, Post, UseGuards, Body, Req, Get, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { PaginationObject } from 'src/models/request.model';
import { RolesGuard } from 'src/auth/role-guard';
import { Roles, Role } from 'src/decorators/role.decorator';
import { ROLE } from 'src/models/entities/role.enum';
import { Auth } from 'src/decorators/request.decorater';


@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService){}
   // addEmployee(employee: Employee, user: User)
   @Post()
   @Auth(ROLE.ADMIN)
    setEmployee(@Req() request, @Body() data: Employee) {
     return  this.employeeService.addEmployee(data, request.user);
   }

   @Get()
   @Auth(ROLE.USER)
   getMyEmployee(@Req() request) {
     return  this.employeeService.getMyEmployee( request.user);
   }

   
   @Post('get')
   @Auth(ROLE.ADMIN)
    getEmployee(@Req() request, @Body() data: PaginationObject) {
     return  this.employeeService.getEmployees(data, request.user);
   }
   @Post('delete')
   @Auth(ROLE.ADMIN)
    deleteEmployee( @Body() data: Employee) {
     return  this.employeeService.deleteEmployee(data);
   }
}
