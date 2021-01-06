import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuditHead } from './audit.entity';
import { Repository, In, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/user.entity';
import { AspectType } from 'src/models/enums/aspect.modal';
import { Aspect, AspectPhoto } from 'src/modules/audits/audit_aspect/aspect.entity';
import { UtilsService } from 'src/services/utils.service';
import { AreaService } from '../area/area.service';
import { Employee } from '../employee/employee.entity';
import { AuditAction } from './audit_aspect/action.entity';
import { Area, AreaRole } from '../area/area.entity';
import { AuditDto } from './audit.dto';
import { ResponceStatus } from 'src/models/responceStatus.model';

@Injectable()
export class AuditsService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(AuditHead) private readonly auditHeadRepository: Repository<AuditHead>,
        @InjectRepository(Aspect) private readonly aspectRepository: Repository<Aspect>,
        @InjectRepository(AuditAction) private readonly actionRepository: Repository<AuditAction>,
        @InjectRepository(AspectPhoto) private readonly photoRepository: Repository<AspectPhoto>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        private readonly connection: Connection,
        private readonly areaService: AreaService,
        private readonly utilityService: UtilsService) { }

    async setAuditHead(audit: AuditHead, user: User): Promise<AuditHead> {
        if (!audit || !user) {
            throw new HttpException('Missinng audit', HttpStatus.BAD_REQUEST);
        }
        audit = this.utilityService.removeNullProperty("id", audit);
        const userData = this.userRepository.create(user);
        const auditHeadDto = this.auditHeadRepository.create(audit);
        const employee = await this.employeeRepository.findOne({ user: userData })
        auditHeadDto.employee = employee;
        auditHeadDto.user = userData;
        auditHeadDto.auditStatus = auditHeadDto.auditStatus || 'S';

        try {
            const audditSaved = await this.auditHeadRepository.save(auditHeadDto);
            return audditSaved.toResponceObject();
        }
        catch (e) {
            throw new HttpException('save error', HttpStatus.BAD_REQUEST);
        }

    }

    async submitAudit(auditHead: AuditHead, user: User): Promise<string[]> {
        if (!auditHead || !user) {
            throw new HttpException('Not Valid', HttpStatus.BAD_REQUEST);
        }

        const audit = await this.auditHeadRepository.findOne({
            relations: ['aspects', 'aspects.auditAction'],
            where: {
                id: auditHead.id,
                'user': user,
            },
        });
        if (!audit) {
            throw new HttpException({ status: 'No data' }, 200);
        }

        //valdiations 
        const areaRoles = await this.areaService.getArearesponsible(auditHead.area);
        const responseList = [];
        if (areaRoles.roles.length) {
            areaRoles.roles.forEach(e => responseList.push(e.responsible.email));
        }
        // TODO add Checks

        try {
            await this.auditHeadRepository.update({ id: audit.id }, { auditStatus: 'B' });
            return responseList;
        } catch (e) {
            throw new HttpException('submit failed', 400);
        }

    }

    async getNumberOfAuditsTobeDistribuied(user: User): Promise<number> {
        // all the audits that are of my area and have status submited  
        const user2 = await this.userRepository.findOne({ where: { email: user.email } });
        const employee = await this.areaService.getEmployee(user2)

        if (!employee) {
            return 0;
        }
        const employeeId = employee.id;
        const data = await this.connection.getRepository('Aspect')
            .createQueryBuilder("aspect")
            .innerJoinAndSelect("aspect.audit", "audit")
            .innerJoin(AreaRole, "arearole", `arearole.role = aspect.categoryType  and "arearole"."responsibleId" =:employeeId`, { employeeId })
            .innerJoinAndSelect(Area, "area", 'area.area = audit.area and "arearole"."areaId" = "area"."id"')
            .andWhere("aspect.status='S'")
            .andWhere("aspect.type='N'")
            // .andWhere("audit.auditStatus='B'")
            .orderBy("audit.area")
            .getCount();

        return data;

    }

    async getAuditsTobeDistribuied(user: User): Promise<Aspect[]> {
        // all the audits that are of my area and have status submited    
        const employee = await this.areaService.getEmployee(user)
        if (!employee) {
            return;
        }
        const employeeId = employee.id;
        const data =
            await this.connection.getRepository<Aspect>('Aspect')
                .createQueryBuilder("aspect")
                .leftJoinAndSelect("aspect.auditAction", "auditAction")
                .leftJoinAndSelect("aspect.photos", "photos")
                .leftJoinAndSelect("auditAction.responsible", "responsible")
                .innerJoinAndSelect("aspect.audit", "audit")
                .innerJoin(AreaRole, "arearole", `arearole.role = aspect.categoryType  and "arearole"."responsibleId" =:employeeId`, { employeeId })
                .innerJoinAndSelect(Area, "area", 'area.area = audit.area and "arearole"."areaId" = "area"."id"')
                .innerJoinAndSelect("audit.employee", "employee")
                .andWhere("aspect.status='S'")
                .andWhere("aspect.type='N'")
                // .andWhere("audit.auditStatus='B'")
                .orderBy("audit.area")
                .getMany();

        return data;

    }




    async getMyReponsabilittyAspects(user: User): Promise<Aspect[]> {
        const employee = await this.employeeRepository.findOne({ where: { user: user } });
        if (!employee) {
            return;
        }
        const employeeId = employee.id;
        const aspects = this.connection.getRepository<Aspect>('Aspect')
            .createQueryBuilder("aspect")
            .innerJoinAndSelect("aspect.auditAction", "auditAction")
            .leftJoinAndSelect("aspect.photos", "photos")
            .innerJoinAndSelect("auditAction.responsible", "responsible")
            .innerJoinAndSelect("aspect.audit", "audit")
            .leftJoinAndSelect("audit.employee", "employee")
            .where('"auditAction"."responsibleId" = :employeeId', { employeeId })
            .andWhere("aspect.status='A'")
            .andWhere("aspect.type='N'")
            .orderBy("audit.area")
            .getMany();
        return aspects;
    }

    async getMyRejectedAspectsNumber(user: User): Promise<number> {
        const userDbo = await this.userRepository.findOne({ where: { email: user.email } });
        const userId = userDbo.id;
        const aspectsCount = await this.connection.getRepository('Aspect')
            .createQueryBuilder("aspect")
            .innerJoinAndSelect("aspect.audit", "audit")
            .where("aspect.status='Z'")
            .andWhere('"audit"."userId" = :userId', { userId })
            .getCount();
        return aspectsCount;
    }

    async getMyRejectedAspects(user: User): Promise<Aspect[]> {  
        const userDbo = await this.userRepository.findOne({ where: { email: user.email } });
        const userId = userDbo.id;
        const aspects = await this.connection.getRepository<Aspect>('Aspect')
            .createQueryBuilder("aspect")
            .innerJoinAndSelect("aspect.auditAction", "auditAction")
            .leftJoinAndSelect("aspect.photos", "photos")
            .innerJoinAndSelect("auditAction.responsible", "responsible")
            .innerJoinAndSelect("aspect.audit", "audit")
            .leftJoinAndSelect("audit.employee", "employee")
            .where("aspect.status='Z'")
            .andWhere('"audit"."userId" = :userId', { userId })
            .getMany();
        return aspects;
    }
  
    async getMyReponsabilittyAspectsNumber(user: User): Promise<number> {
        const user2 = await this.userRepository.findOne({ where: { email: user.email } });
        const employee = await this.employeeRepository.findOne({ where: { user: user2 } });
        if(!employee) {
            return;
        }
        const employeeId = employee.id;
        const aspectsCount = await this.connection.getRepository('Aspect')
            .createQueryBuilder("aspect")
            .innerJoinAndSelect("aspect.auditAction", "auditAction")
            .where('"auditAction"."responsibleId" = :employeeId', { employeeId })
            .andWhere("aspect.status='A'")
            .getCount();
        return aspectsCount;
    }


    async getAudits(user: User): Promise<AuditDto[]> {
        try {
            const audits = await this.auditHeadRepository.find({
                relations: ['aspects', 'aspects.auditAction', 'aspects.auditAction.responsible', 'aspects.photos'],
                where: {
                    'user': user,
                    auditStatus: 'S'
                },
            });
            return this.mapTOAuditDTo(audits);
        } catch (e) {
            throw new HttpException('error acured', HttpStatus.BAD_REQUEST);
        }
    }
    // simplyfy request
    async getAllAudits(user: User): Promise<AuditDto[]> {
        try {
            const audits = await this.auditHeadRepository.find({
                relations: ['aspects', 'aspects.auditAction', 'aspects.auditAction.responsible', 'aspects.photos'],
                where: {
                    'user': user
                },
                take: 50,
                skip: 0,
                // order: { createdDate: "ASC" }
            });
            return this.mapTOAuditDTo(audits);
        } catch (e) {
            throw new HttpException('error acured', HttpStatus.BAD_REQUEST);
        }
    }

    filterAspects(list: Aspect[], aspectType: AspectType): Aspect[] {
        if (!list || !list.length) {
            return [];
        }
        return list.filter(data => data.type === aspectType);

    }
    /*
    Deletes audt nad aspect and photo and auditacttions
    */
    async deleteAudit(audit: AuditHead, user: User): Promise<ResponceStatus> {
        if (!audit || !user) {
            return;
        }
        let auditHeadDto;
        try {
            auditHeadDto = await this.auditHeadRepository.findOne({ where: { id: audit.id, userId: user.id } });
        } catch (e) {
            return { status: 'data does not exist' };
        }

        if (!auditHeadDto) {
            return { status: 'data does not exist' };
        }

        try {
            const outpu2t = await this.aspectRepository.find({ where: { audit: { id: auditHeadDto.id } }, select: ['id'] })
            const actionQueries = outpu2t;
            if (actionQueries && actionQueries.length) {
                const data = [];
                const aspectIdList = [];
                actionQueries.forEach(element => {
                    if (element.auditActionId) {
                        data.push(element.id);
                    }
                    aspectIdList.push(element.id);
                });
                // console.log(aspectIdList);

                if (aspectIdList.length) await this.photoRepository.delete({ aspectId: In([...aspectIdList]) });
                if (data.length) await this.actionRepository.delete({ aspectId: In([...data]) });
                await this.aspectRepository.delete({ auditId: audit.id });
            }

            await this.auditHeadRepository.delete({ id: auditHeadDto.id });
            return { status: 'succes' };
        } catch (e) {
            return { status: 'error' };
        }
    }

    mapTOAuditDTo(audits: AuditHead[]): AuditDto[] {
        return audits.map(data => {
            return {
                auditHead: {
                    id: data.id,
                    area: data.area,
                    step: data.step,
                    auditType: data.auditType,
                    sector: data.sector,
                    auditStatus: data.auditStatus,
                    createdDate: data.createdDate,
                },
                positiveAspects: this.filterAspects(data?.aspects, AspectType.Positive),
                negativeAspects: this.filterAspects(data?.aspects, AspectType.Negative)

            }
        });
    }

}
