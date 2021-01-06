import { Controller, Get, Post, Body, Req, Delete, Query } from '@nestjs/common';
import { AuditsService } from './audits.service';;
import { AuditDto } from './audit.dto';
import { AuditHead } from './audit.entity';
import { Auth } from 'src/decorators/request.decorater';
import { ROLE } from 'src/models/enums/role.enum';
import { AuditGateway } from './audit.gateway';
import { CustomRequest } from 'src/models/customRequest.model';
import { Aspect } from './audit_aspect/aspect.entity';
import { ResponceStatus } from 'src/models/responceStatus.model';

@Controller()
export class AuditsController {
  constructor(private readonly auditService: AuditsService,
              private readonly auditGateway: AuditGateway) { };
  @Get('audits')
  @Auth(ROLE.USER)
  async getaudits(@Req() request: CustomRequest): Promise<AuditDto[]> {
    return await this.auditService.getAudits(request.user);
    

  }
  
  @Get('myAudits')
  @Auth(ROLE.USER)
  async getMyaudits(@Req() request: CustomRequest): Promise<AuditDto[]> {
    return await this.auditService.getAllAudits(request.user);  
  }
  
  @Post('audit')
  @Auth(ROLE.USER)
  async setAuditHead(@Req() request: CustomRequest, @Body() data: AuditHead): Promise<AuditHead> {
    return await this.auditService.setAuditHead(data, request.user);

  }
 
  @Post('submitAudit')
  @Auth(ROLE.USER)
  async submitAuditHead(@Req() request: CustomRequest, @Body() data: AuditHead): Promise<ResponceStatus> {
    const responsibleList =  await this.auditService.submitAudit(data, request.user);
    if(responsibleList.length) {
      this.auditGateway.emitTo(responsibleList);
    }
      return { status: 'succes' };
  }

  @Get('auditsToApprove')
  @Auth(ROLE.USER)
  async getAuditsTobeDistribuied(@Req() request: CustomRequest): Promise<Aspect[]>  {
    return this.auditService.getAuditsTobeDistribuied( request.user);
  }

  @Get('auditsToFix')
  @Auth(ROLE.USER)
  async getAuditsToFix(@Req() request: CustomRequest ): Promise<Aspect[]> {
    return this.auditService.getMyReponsabilittyAspects( request.user);
  }

  @Get('rejected')
  @Auth(ROLE.USER)
  async getRejectedAudits(@Req() request: CustomRequest ): Promise<Aspect[]> {
    return this.auditService.getMyRejectedAspects( request.user);
  }
  @Delete('audits')
  @Auth(ROLE.USER)
  deleteAudit(@Req() request: CustomRequest, @Query() query: AuditHead): Promise<ResponceStatus> {
    return this.auditService.deleteAudit(query, request.user).then(data => data)
  
  }

}
