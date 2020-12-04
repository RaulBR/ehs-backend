import { Controller,  Req, Delete, Body, Query, Post} from '@nestjs/common';
import { AspectService } from '../aspect.service';
import { AspectCrudRequest } from '../aspect.model';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/enums/role.enum';
import { Aspect } from '../aspect.entity';


@Controller('aspect')
export class AspectController {
    constructor(private readonly aspectService: AspectService){}
    
    
    @Delete()
    @Auth(ROLE.USER)
    deleteAspect(@Req() request, @Query() query) {
      return this.aspectService.deleteAspect(query, request.user).then(data => data)
        .catch(e => { status: 'error' });
    }
  
    @Post()
    @Auth(ROLE.USER)
     setAspect(@Req() request, @Body() data: AspectCrudRequest) {
      return  this.aspectService.setAspect(data, request.user);
  
    }
    @Post('reject')
    @Auth(ROLE.USER)
     rejectAspect(@Req() request, @Body() data: Aspect) {
      return  this.aspectService.rejectAspect(data, request.user);
  
    }
    @Post('accept')
    @Auth(ROLE.USER)
     acceptAspect(@Req() request, @Body() data: Aspect) {
      return  this.aspectService.acceptAspect(data, request.user);
  
    }

    @Post('resolve')
    @Auth(ROLE.USER)
     resolveAspect(@Req() request, @Body() data: Aspect) {
      return  this.aspectService.resolveAspect(data, request.user);
  
    }

}
