import {  PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';


export abstract class BaseObject {
    @PrimaryGeneratedColumn('uuid') id?: string;
    @CreateDateColumn({ type: 'date' }) createdDate?: Date;
}

