import { Controller, Post, Body, Req } from '@nestjs/common';
import { AreaService } from './area.service';
import { Area, AreaRole } from './area.entity';
import { PaginationObject } from 'src/models/request.model';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/entities/role.enum';


@Controller('area')
export class AreaController {
    constructor(private readonly areaService: AreaService) {}

    @Post()
    @Auth(ROLE.ADMIN)
     setArea(@Req() request, @Body() data: Area) {
      return this.areaService.saveArea(data, request.user);
    }

    @Post('/get')
    @Auth(ROLE.USER)
     getArea(@Req() request, @Body() data: PaginationObject) {
      return this.areaService.getAreas(data, request.user);
    }

    @Post('/roledelete')
    @Auth(ROLE.ADMIN)
     deleteRole(@Body() data: AreaRole) {
      return this.areaService.deleteAreaRole(data); 
    }
 
    @Post('/delete')
    @Auth(ROLE.ADMIN)
     deletearea(@Body() data: Area) {
      return this.areaService.deleteArea(data);
    }

    
}
