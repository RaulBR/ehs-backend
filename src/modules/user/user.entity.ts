import { Entity, Column, BeforeInsert, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { BaseObject } from "src/models/entities/base.entity";
import * as bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ROLE } from "src/models/enums/role.enum";
import { Role } from "src/decorators/role.decorator";
@Entity()
export class UserRole extends BaseObject {
    @Column({nullable: true})
    role: string;
    userId?: string;
    @ManyToMany(type => User , user => user.roles)
    @JoinTable({name:'user_role_users_user'})
    users: User [];
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
    @JoinTable({name:'user_role_users_user'})
    roles?: UserRole [];
    @IsNotEmpty()
    @IsString()
    @Length(4, 300 , { message: 'Minim 4 charactere' })
    @Column()
    password?: string;
    token?: string
    role?: string;
    toResponceObject?() {
        const { id, email, roles } = this;
        let role;
        if(this.roles && this.roles.length) {
            
            role = this.getTopRole(this.roles);
        }
        return { id, email, role, roles };
    }
    @BeforeInsert()
    async beforeInsert?() {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

    }

    async compare?(textPass: string) {
        console.log(await bcrypt
            .compare(textPass, this.password));
        return await bcrypt
            .compare(textPass, this.password);
    }
   
    private getTopRole?(roles: UserRole[]) {
        let role2: string;
        roles.forEach(element => {
            if(element.role === ROLE.ADMIN) {
                role2 = ROLE.ADMIN;
            }
            if(element.role === ROLE.MANAGER && role2 != ROLE.ADMIN) {
                role2 = ROLE.MANAGER;
            }
        });
        return role2 || ROLE.USER;

    }
}

