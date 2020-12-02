import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AspectCrudRequest } from './aspect.model';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditHead, } from 'src/modules/audits/audit.entity';
import { Connection, Repository } from 'typeorm';
import { UtilsService } from 'src/services/utils.service';
import { AspectPhoto, Aspect } from 'src/modules/audits/audit_aspect/aspect.entity';
import { User } from '../../user/user.entity';
import { Employee } from '../../employee/employee.entity';
import { AuditAction } from './action.entity';
import { AreaService } from '../../area/area.service';
import { AspectSate } from 'src/models/enums/aspect.modal';
import { AuditGateway } from '../audit.gateway';

@Injectable()
export class AspectService {

    constructor(
        @InjectRepository(User) private readonly userHeadRepository: Repository<User>,
        @InjectRepository(AuditHead) private readonly auditHeadRepository: Repository<AuditHead>,
        @InjectRepository(Aspect) private readonly aspectRepository: Repository<Aspect>,
        @InjectRepository(AuditAction) private readonly actionRepository: Repository<AuditAction>,
        @InjectRepository(AspectPhoto) private readonly aspectphotoRepository: Repository<AspectPhoto>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        private readonly areaService: AreaService,
        private readonly connection: Connection,
        private readonly utilsService: UtilsService,
        private readonly sockerts: AuditGateway) { }

    // TODO move error messages to constants
    // TODO move status messages to constants

    async setAspect(aspectRequest: AspectCrudRequest, user: User): Promise<AspectCrudRequest> {
        if (!aspectRequest) {
            throw new HttpException({audit:'Setati o zona de audiare'}, HttpStatus.BAD_REQUEST);
        }
        let auditHead = aspectRequest.auditHead || null;
        if (!auditHead) {
            throw new HttpException({audit:'Setati o zona de audiare'}, HttpStatus.BAD_REQUEST);
        }
        let audit;
        const userData = this.userHeadRepository.create(user);
        if (auditHead.id) {
            audit = await this.auditHeadRepository.findOne({ where: { id: auditHead.id, userId: user.id } });
            if (!audit) {
                throw new HttpException({audit:'Setati o zona de audiare'}, HttpStatus.BAD_REQUEST);
            }

        } else {
            auditHead = this.utilsService.removeNullProperty('id', auditHead);
            let auditHeadDto = this.auditHeadRepository.create(auditHead);
            const employee = await this.employeeRepository.findOne({ user: userData })
            auditHeadDto.auditStatus = auditHeadDto.auditStatus || 'S';
            auditHeadDto.employee = employee;
            auditHeadDto.user = userData;
            audit = await this.auditHeadRepository.save(auditHeadDto);
        }



        try {
            return this.connection.transaction(async manager => {

                aspectRequest.aspect = this.utilsService.removeNullProperty('id', aspectRequest.aspect);
                const actionObject = aspectRequest.aspect
                const aspect: Aspect = this.aspectRepository.create(aspectRequest.aspect);
                aspect.status = 'S';
                aspect.audit = audit;
                if (actionObject.auditAction) {
                    aspect.auditAction = this.utilsService.removeNullProperty('id', actionObject.auditAction);
                    const employee = actionObject.auditAction.responsable ? this.employeeRepository.create(actionObject.auditAction.responsable) : null;
                    const action = this.actionRepository.create(actionObject.auditAction);
                    action.responsable = employee;
                    aspect.auditAction = action;
                }
                if (aspect.photos && aspect.photos.length) {
                    const photoList = [];
                    aspect.photos.forEach(photo => {
                        if (photo.photo) {
                            photo = this.utilsService.removeNullProperty('id', photo);
                            photo = this.utilsService.removeNullProperty('aspectId', photo);
                            const photorepo = this.aspectphotoRepository.create(photo);
                            photorepo.user = userData;
                            photoList.push(photorepo);
                        }

                    });
                    aspect.photos = photoList;
                }

                const saveldAspect = await manager.save(aspect);

                return {
                    auditHead: audit.toResponceObject(),
                    aspect: saveldAspect.toResponceObject(),
                }
            });

        } catch (e) {
            throw new HttpException(e, HttpStatus.NOT_FOUND);
        }

    }

    async deleteAspect(aspect: Aspect, user: User) {
        if (!aspect || !user) {
            return new HttpException('Missinng aspect or auth', HttpStatus.BAD_REQUEST);
        }
        const aspectfound = await this.aspectRepository.findOne({ where: { id: aspect.id } });
        if (!aspectfound) {
            return new HttpException('No data', HttpStatus.BAD_REQUEST);
        }

        const auditHead = await this.auditHeadRepository.findOne({ where: { id: aspectfound.auditId, userId: user.id } });
        if (!auditHead) {
            return new HttpException('No audit head', HttpStatus.BAD_REQUEST);
        }

        return this.aspectRepository.delete({ id: aspect.id })
    }


    // add websocket
    async acceptAspect(data: Aspect, user: any): Promise<Aspect> {
        if (!this.IsUserResposible(user, data))
            throw new HttpException('accept faild', HttpStatus.OK);
        // 
        let action: AuditAction = data.auditAction
        action = this.utilsService.removeNullProperty('id', action);
        action = this.actionRepository.create(action);
        let aspect: Aspect;
        try {
            aspect = await this.statusUpdateAspect(data, user, AspectSate.Approved);
            aspect.auditAction = await this.actionRepository.save(action);
            if(aspect.auditAction.responsable) {
              await  this.sockerts.emitAuditisToDistributeForUser(user.email);
              await  this.sockerts.emitMyReponsabilittyAspectsForUser(aspect.auditAction.responsable.email);
                // emit to resposible
                // reemit for me.
            }
        } catch (e) {
            console.error(e);
            throw new HttpException('accept faild', HttpStatus.OK);
        }
        // emit
        return aspect;
    }

    // need to add a way to write modive
    // perhaps a column or tabel for comments
    async rejectAspect(data: Aspect, user: any): Promise<Aspect> {
        let isAllawed = await this.IsUserResposible(user, data);
        if (!isAllawed) {
            throw new HttpException('reject faild', HttpStatus.OK);
        }
        return await this.statusUpdateAspect(data, user, AspectSate.Resolved);
    }

    // must add notifications for superviser
    async resolveAspect(data: Aspect, user: any): Promise<Aspect> {
        if (!this.IsUserResposible(user, data))
            throw new HttpException('accept faild', HttpStatus.OK);
        // 
        let action: AuditAction = data.auditAction
        action = this.utilsService.removeNullProperty('id', action);
        action = this.actionRepository.create(action);
        let aspect: Aspect;
        try {
            aspect = await this.statusUpdateAspect(data, user, AspectSate.Resolved);
            await  this.sockerts.emitMyReponsabilittyAspectsForUser(user.email);
        } catch (e) {
            throw new HttpException('accept faild', HttpStatus.OK);
        }

        return aspect;
    }


    private async statusUpdateAspect(aspect: Aspect, user: any, status): Promise<Aspect> {
        try {
            await this.connection.getRepository('Aspect')
                .createQueryBuilder()
                .update(Aspect)
                .set({ status: status })
                .where("id = :val", { val: aspect.id })
                .execute();
            return aspect

        } catch (e) {
            console.log(e);
            throw new HttpException('Cannot reject', HttpStatus.BAD_REQUEST);
        }
    }

    private async getAspectArea(aspect: Aspect): Promise<string> {
        if (!aspect) {
            return;
        }
        try {
            let area = await this.auditHeadRepository.findOne({ id: aspect.auditId });
            return area.area;
        }
        catch (e) {
            return
        }
    }
  
    private async IsUserResposible(user, data: Aspect): Promise<boolean> {
        let area = await this.getAspectArea(data);
        const areaResposible = await this.areaService.getEmployeeAreas(user);
        if (!area) return false;
        if (!areaResposible.length) return false;
        return !!areaResposible.find(element => element === area);
    }

}
