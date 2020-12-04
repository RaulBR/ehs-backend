import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { BaseObject } from "src/models/entities/base.entity";
import { User } from "src/modules/user/user.entity";

// audit type (safety, health, enviromanet)
@Entity()
export class CategoryType extends BaseObject {

    @Column() type: string;
    @ManyToOne(type => User)
    createdUser?: User;
    @OneToMany(type => Category, category => category.categoryType, { cascade: true })
    categories: Category[];

    toResponceObject?(): CategoryType {
        const { id, type, categories } = this;
        return { id, type, categories};
    }
}

// category for evey oudit type
@Entity()
export class Category extends BaseObject {
    @Column() category: string;
    // @Column() description: String;
    @ManyToOne(type => User)
    createdUser?: User;
    categoryId?: string;
    @ManyToOne(type => CategoryType, categoryType => categoryType.categories)
    @JoinColumn({ name: 'categoryId' })
    categoryType: CategoryType;
    
    toResponceObject?(): Category {
        const { id, category, categoryType } = this;
        return { id, category, categoryType };
    }
}

