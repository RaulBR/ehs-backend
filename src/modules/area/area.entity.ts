import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseObject } from "src/models/entities/base.entity";
import { User } from "../user/user.entity";
import { Employee } from "../employee/employee.entity";


@Entity()
export class Area extends BaseObject {
    @Column({ unique: true }) area: String;
    @Column({ nullable: true }) areaInfo: String;
    @ManyToOne(type => User)
    createdUser?: User;
    @OneToMany(type => AreaStep, steps => steps.area, { cascade: true })
    steps: AreaStep[];
    @OneToMany(type => AreaRole, role => role.area, { cascade: true, nullable: true })
    roles?: AreaRole[];

    toResponceObject?(): Area {
        const { area, areaInfo, id, steps, roles } = this;
        return { area, areaInfo, id, steps, roles };
    }
}

@Entity()
export class AreaStep extends BaseObject {
    @Column() step: String;
    @Column() stepinfo: String;
    areaId?: String;
    @ManyToOne(type => Area, area => area.steps)
    @JoinColumn({ name: 'areaId' })
    area?: Area;
    @ManyToOne(type => User)
    createdUser?: User;
    toResponceObject?(): AreaStep {
        const { step, stepinfo, id, } = this;
        return { step, stepinfo, id };

    }
}

@Entity()
export class AreaRole extends BaseObject {
    @Column() role: String;
    areaId?: String;
    @ManyToOne(type => Area)
    @JoinColumn({ name: 'areaId' })
    area: Area;
    responsableId?: String;
    @ManyToOne(type => Employee)
    @JoinColumn({ name: 'responsableId' })
    responsable: Employee;
    @ManyToOne(type => User)
    createdUser: User;
}
