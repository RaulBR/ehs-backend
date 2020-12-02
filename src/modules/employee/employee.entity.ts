import { Entity, Column, ManyToOne, JoinColumn, } from "typeorm";

import { BaseObject } from "src/models/entities/base.entity";
import { User } from "../user/user.entity";

@Entity()
export class Employee extends BaseObject {
    @Column({ nullable: true }) firstName: String;
    @Column({ nullable: true }) lastName: String;
    @Column({ nullable: true }) role: String;
    @Column({ unique: true, nullable: true }) email: string;
    @ManyToOne(type => User)
    createdUser?: User;
    @ManyToOne(type => User)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user?: User;
    toResponceObject?(): Employee {
        const { id, firstName, lastName, email, role } = this;
        return { id, firstName, lastName, email, role };

    }
}
