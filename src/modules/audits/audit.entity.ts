import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseObject } from 'src/models/entities/base.entity';

import { Aspect } from 'src/modules/audits/audit_aspect/aspect.entity';
import { User } from '../user/user.entity';
import { Employee } from '../employee/employee.entity';


@Entity()
export class AuditHead extends BaseObject {
    @Column({ nullable: true }) area: string;
    @Column({ nullable: true }) step: string;
    @Column({ nullable: true }) sector: string;
    @Column({ default: "S" }) auditStatus: string;

    @OneToMany(type => Aspect, aspect => aspect.audit)
    aspects: Aspect[];
    @Column() userId?: string;
    @ManyToOne(type => User, { primary: true })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user?: User;

    @ManyToOne(type => Employee, { nullable: true})
    @JoinColumn({ name: 'employeeId', referencedColumnName: 'id' })
    employee?: Employee;


    toResponceObject?(): AuditHead {
        const { area, step, sector, id, auditStatus, aspects, createdDate } = this;
        return { area, step, sector, id, auditStatus, aspects, createdDate };
    }
}

@Entity()
export class SocketListing extends BaseObject {
    @Column() socketId: string;
    @Column() email: string;
    
    toResponceObject?(): SocketListing {
        const { socketId, email  } = this;
        return { socketId, email };

    }


}













