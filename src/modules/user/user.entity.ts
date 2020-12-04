import { Entity, Column, BeforeInsert, ManyToMany, JoinTable } from "typeorm";
import { BaseObject } from "src/models/entities/base.entity";
import * as bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
@Entity()
export class UserRole extends BaseObject {
    @Column({nullable: true})
    role: string;
    @ManyToMany(type => User , user => user.roles)
    users?: User [];
    @BeforeInsert()
    async beforeInsert?() {
        this.role =  this.role || 'USER';

    }
    toResponceObject?() {
        const { role } = this;
        return { role };
    }

}

@Entity()
export class User extends BaseObject {
    @IsEmail(
        {}, { message: 'Trebuie sa fie mail' }
     )
    @Column()
    email: string;
    @ManyToMany(type => UserRole, role => role.users)
    @JoinTable()
    roles?: UserRole [];
    @IsNotEmpty()
    @IsString()
    @Length(4, 300 , { message: 'Minim 4 charactere' })
    @Column()
    password?: string;
    token?: string
    role?: string;
    toResponceObject?() {
        const { id, email } = this;
        let role;
        if(this.roles && this.roles.length) {
            role = this.roles[0].role;
        }
        return { id, email, role };
    }
    @BeforeInsert()
    async beforeInsert?() {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

    }
    async compare?(textPass: string) {
        return await bcrypt
            .compare(textPass, this.password);
    }
}

