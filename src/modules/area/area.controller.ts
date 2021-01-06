import { Controller, Post, Body, Req } from '@nestjs/common';
import { AreaService } from './area.service';
import { Area, AreaRole, AreaStep } from './area.entity';
import { PaginationObject } from 'src/models/request.model';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/enums/role.enum';
import { CustomRequest } from 'src/models/customRequest.model';
import { DeleteResult } from 'typeorm';

@Controller('area')
export class AreaController {
    constructor(private readonly areaService: AreaService) {}

    @Post()
    @Auth(ROLE.ADMIN)
     setArea(@Req() request: CustomRequest, @Body() data: Area): Promise<Area> {
      return this.areaService.saveArea(data, request.user);
    }

    @Post('/get')
    @Auth(ROLE.USER)
     getArea(@Body() data: PaginationObject): Promise<Area[]> {
      return this.areaService.getAreas(data);
    }

    @Post('/roledelete')
    @Auth(ROLE.ADMIN)
     deleteRole(@Body() data: AreaRole): Promise<Area> {
      return this.areaService.deleteAreaRole(data); 
    }
 
    @Post('/delete')
    @Auth(ROLE.ADMIN)
     deletearea(@Body() data: Area): Promise<Area[]>  {
      return this.areaService.deleteArea(data);
    }
    @Post('/deleteStep')
    @Auth(ROLE.ADMIN)
     deleteStep(@Body() data: AreaStep ,@Req() request: CustomRequest): Promise<DeleteResult>  {
      return this.areaService.deleteAreaStep(data, request.user);
    }

    
}
``