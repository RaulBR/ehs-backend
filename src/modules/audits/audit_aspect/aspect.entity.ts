import { Column, Entity, OneToOne, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { AuditHead } from "src/modules/audits/audit.entity";
import { BaseObject } from "src/models/entities/base.entity";
import { User } from "../../user/user.entity";
import { AuditAction } from "./action.entity";

@Entity()
export class Aspect extends BaseObject {
    @Column()
    categoryType: string;
// change to stept object
// @OneToOne(type => AreaStep)
// @JoinColumn({ name: 'areaStepId' })
// areaStep: AreaStep;
    @Column({ nullable: true })
    areaStep: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    comment: string;

    @Column({ nullable: true })
    rejectComment: string;

    @Column({nullable: true})
    equipment: string;

    @Column()
    type: string;

    @Column({ default: "S" })
    status: string;

  //  @Column({ nullable: true })
    auditActionId?: string;

    @OneToOne(type => AuditAction, action => action.aspect , { cascade: true })
    @JoinColumn({ name: 'auditActionId' })
    auditAction: AuditAction;

    @Column()
    auditId?: string;

    @ManyToOne(type => AuditHead, audit => audit.aspects)
    @JoinColumn()
    audit?: AuditHead;
    
    @OneToMany(type => AspectPhoto, photos => photos.aspect, { cascade: true })
    photos: AspectPhoto[];
    
    photoIds: string[];
    state?;

    toResponceObject?(): Aspect {
        const { category, comment, photos, status, id, auditAction, createdDate, type, categoryType, equipment , areaStep ,rejectComment} = this;
        const photoIds = photos.map(element => element.id)
        return { category, comment, photos, status, id, auditAction, createdDate, type, photoIds, categoryType , equipment, areaStep, rejectComment}

    }
}

@Entity()
export class AspectPhoto extends BaseObject {
    @Column('text', {
        nullable: true,
        select: false
    })
    photo: string;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    size: string;
    
    @Column({ nullable: true, select: false })
    aspectId?: string;

    @Column({ select: false })
    userId: string;

    @ManyToOne(type => Aspect, aspect => aspect.photos ,{onDelete: 'CASCADE'})
    @JoinColumn({ name: 'aspectId' })
    aspect: Aspect;

    @ManyToOne(type => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    toResponceId?(): { id: string } {
        const { id } = this;
        return { id };
    }
}

