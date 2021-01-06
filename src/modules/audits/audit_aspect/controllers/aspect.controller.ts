import { Controller,  Req, Delete, Body, Query, Post} from '@nestjs/common';
import { AspectService } from '../aspect.service';
import { AspectCrudRequest } from '../aspect.model';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/enums/role.enum';
import { Aspect } from '../aspect.entity';
import { DeleteResult } from 'typeorm';
import { CustomRequest } from 'src/models/customRequest.model';


@Controller('aspect')
export class AspectController {
    constructor(private readonly aspectService: AspectService){}
    
    
    @Delete()
    @Auth(ROLE.USER)
    deleteAspect(@Req() request: CustomRequest, @Query() query :Aspect): Promise<DeleteResult> {
      return this.aspectService.deleteAspect(query, request.user).then(data => data);
    }
  
    @Post()
    @Auth(ROLE.USER)
    // thos Promise<AspectCrudRequest> is wiard and should not be used
     setAspect(@Req() request: CustomRequest, @Body() data: AspectCrudRequest): Promise<AspectCrudRequest> {
      return  this.aspectService.setAspect(data, request.user);
  
    }
    @Post('reject')
    @Auth(ROLE.USER)
     rejectAspect(@Req() request: CustomRequest, @Body() data: Aspect): Promise<Aspect> {
      return  this.aspectService.rejectAspect(data, request.user);
  
    }
    @Post('accept')
    @Auth(ROLE.USER)
     acceptAspect(@Req() request: CustomRequest, @Body() data: Aspect): Promise<Aspect>{
      return  this.aspectService.acceptAspect(data, request.user);
  
    }

    @Post('resolve')
    @Auth(ROLE.USER)
     resolveAspect(@Req() request: CustomRequest, @Body() data: Aspect): Promise<Aspect> {
      return  this.aspectService.resolveAspect(data, request.user);
  
    }

}
