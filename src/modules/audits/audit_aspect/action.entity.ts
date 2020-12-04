import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Employee } from "../../employee/employee.entity";
import { Aspect } from "./aspect.entity";
import { BaseObject } from "src/models/entities/base.entity";

@Entity()
export class AuditAction extends BaseObject {
    @Column('bool') imidiatAcction: boolean;
    responsableId?: string;
    @ManyToOne(type => Employee)
    @JoinColumn({ name: 'responsableId' })
    responsable: Employee;
    @Column({ type: 'date' }) limitDate: Date;
    @Column({ nullable: true }) comment: string;
    aspectId?: string;
    @OneToOne(type => Aspect, aspect => aspect.auditAction, {onDelete: 'CASCADE'}) // specify inverse side as a second parameter
    aspect: Aspect;

}