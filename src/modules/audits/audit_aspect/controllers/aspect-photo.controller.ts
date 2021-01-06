import { Controller, Req,  Body, Query, Post, Get } from '@nestjs/common';
import { AspectPhoto, Aspect } from '../aspect.entity';
import { ROLE } from 'src/models/enums/role.enum';
import { Auth } from 'src/decorators/request.decorater';
import { PhotoService } from '../photo.service';
import { DeleteResult } from 'typeorm';

@Controller('aspect')
export class AspectPhotoController {
    constructor(private readonly aspectService: PhotoService){}
    
    @Post('/photo')
    @Auth(ROLE.USER)
    async setPhoto(@Req() request, @Body() data: AspectPhoto):  Promise<{id: string}> {
      return await this.aspectService.setPhoto(data, request.user);
  
    }
    
    @Get('/photo')
    @Auth(ROLE.USER)
    async getPhoto(@Req() request,  @Query() data: AspectPhoto) : Promise<AspectPhoto> {
      return await this.aspectService.getPhotoById(data, request.user);
  
    }
    
    @Post('/photos')
    @Auth(ROLE.USER)
     getPhotoBtAspectId(@Req() request,  @Body() data: Aspect): Promise<AspectPhoto[]> {
      return  this.aspectService.getPhotoByAspect(data, request.user);
  
    }
    
    @Post('/delete-photo')
    @Auth(ROLE.USER)
     getdeletePhotoBtAspectId(@Req() request,  @Body() data: AspectPhoto): Promise<DeleteResult> {
      return  this.aspectService.deletePhoto(data, request.user);
  
    }
    
   
}
