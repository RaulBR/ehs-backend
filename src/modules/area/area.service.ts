import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { Area, AreaStep, AreaRole } from './area.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, Like } from 'typeorm';
import { UtilsService } from 'src/services/utils.service';
import { PaginationObject } from 'src/models/request.model';
import { User } from '../user/user.entity';
import { Employee } from '../employee/employee.entity';
import { response } from 'express';


@Injectable()
export class AreaService {

    constructor(
        @InjectRepository(Area) private readonly areaRepository: Repository<Area>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(AreaStep) private readonly areaStepRepository: Repository<AreaStep>,
        @InjectRepository(AreaRole) private readonly areaRolesRepository: Repository<AreaRole>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        private readonly connection: Connection,
        private readonly utilsService: UtilsService
    ) { }

    async saveArea(area: Area, user: User): Promise<Area> {
        // check if Area is unique
        if (!area || !user) {
            throw new HttpException('Missing area incorect request', HttpStatus.BAD_REQUEST);
        }
        const userDTO = this.userRepository.create(user);
        area = this.utilsService.removeNullProperty('id', area);
        const areaDTO = this.areaRepository.create(area);
        areaDTO.createdUser = userDTO;
        const steptList = [];
        if (area.steps && area.steps.length) {
            area.steps.forEach(element => {
                element = this.utilsService.removeNullProperty('id', element);
                const steptDTO = this.areaStepRepository.create(element);
                steptDTO.createdUser = userDTO;
                steptList.push(steptDTO);
            });
            areaDTO.steps = steptList;
        }

        const rolestList = [];
        if (area.roles && area.roles.length) {
            area.roles.forEach(element => {
                element = this.utilsService.removeNullProperty('id', element);
                const roletDTO = this.areaRolesRepository.create(element);

                const employeeDto = this.employeeRepository.create(element.responsable);
                roletDTO.responsable = employeeDto;
                //roletDTO.area = area;
                roletDTO.createdUser = userDTO;
                rolestList.push(roletDTO);
            });
            areaDTO.roles = rolestList;
        }

        try {
            const area = await this.areaRepository.save(areaDTO);
            return area.toResponceObject();
        } catch (e) {
            throw new HttpException({ status: 'save error' }, HttpStatus.BAD_REQUEST);
        }
    }

    async getAreas(rows: PaginationObject, user?: User): Promise<Area[]> {
        const search = rows?.searchQuerry || '';
        rows = this.utilsService.getRows(rows);
        try {
            const result = await this.areaRepository.find({
                where: { area: Like(`%${search}%`) },
                take: rows.toRow,
                skip: rows.fromRow,
                relations: ['steps', 'roles', 'roles.responsable']
            });
            return result.map(element => element.toResponceObject());



        } catch (e) {
            console.error(e);
            throw new HttpException('Retrive faild', HttpStatus.BAD_REQUEST);
        }

    }
   
    async getAreaResponsable(area: string): Promise<Area> {

        try {
            const result = await this.areaRepository.findOne({
                where: { area:  area },
                relations: ['roles', 'roles.responsable']
            });
            return result.toResponceObject();



        } catch (e) {
            console.error(e);
            throw new HttpException('Retrive faild', HttpStatus.BAD_REQUEST);
        }

    }

    async deleteArea(area: Area) {
        try {
            const dataFromDb = await this.areaRepository.findOne({
                where: { id: area.id },
                relations: ['roles', 'steps']
            });
            if (!dataFromDb) {
                return new HttpException('no data', 200);
            }
            return this.connection.transaction(async manager => {
                if (dataFromDb.steps && dataFromDb.steps.length) {
                    await manager.remove<AreaStep>(dataFromDb.steps);
                }
                if (dataFromDb.roles && dataFromDb.roles.length) {
                    await manager.remove<AreaRole>(dataFromDb.roles);
                }
                await manager.remove<Area>(dataFromDb);
                return this.getAreas(null);
            });
        } catch (e) {
            return new HttpException('delete error', 200);
        }
    }

    async addAreaStep(step: AreaStep, user: User) {
        if (!step || !user) {
            return;
        }
        step = this.utilsService.removeNullProperty('id', step);
        const stepDao = this.areaStepRepository.create(step);
        try {
            return await this.areaStepRepository.save(stepDao);
        } catch (e) {
            return { status: 'save error' };
        }

    }

    async deletereaStep(step: AreaStep, user: User) {
        if (!step || !user) {
            return;
        }
        try {
            return await this.areaStepRepository.delete({ id: step.id });
        } catch (e) {
            return { status: 'save error' };
        }
    }

    async deleteAllStepsOfarea(area: Area, user: User) {
        if (!area || !user) {
            return;
        }
        try {
            return await this.areaStepRepository.delete({ areaId: area.id });
        } catch (e) {
            return { status: 'save error' };
        }
    }

    async deleteAreaRole(areaRole: AreaRole) {
        if (!areaRole) {
            return;
        }
        const area = await this.areaRolesRepository.findOne({ where: { id: areaRole.id }, relations: ['area'] });
        await this.areaRolesRepository.delete({ id: areaRole.id });
        if (!area || !area.area) {
            return;
        }
        return await this.areaRepository.findOne({
            where: { id: area.area.id },
            relations: ['steps', 'roles', 'roles.responsable']
        });
        // add delete
    }


    async getEmployeeAreas(user: User): Promise<String[]> {
        try{
            const employee = await this.employeeRepository.findOne({ where: { user: user }});
            const data =  await this.areaRolesRepository.find(
                {
                    relations:['area'],
                    where: {'responsable': employee}
                }
            );
            return data.map(e => e.area.area);

        }catch(e) {
            return [];
        }
        
    }

}
