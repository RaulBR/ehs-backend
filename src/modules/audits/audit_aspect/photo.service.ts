import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  DeleteResult, Repository } from 'typeorm';
import { AspectPhoto, Aspect } from 'src/modules/audits/audit_aspect/aspect.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class PhotoService {

    constructor(
        @InjectRepository(User) private readonly userHeadRepository: Repository<User>,    
        @InjectRepository(AspectPhoto) private readonly aspectphotoRepository: Repository<AspectPhoto>) { }

    async setPhoto(data: AspectPhoto, user: User): Promise<{id: string}> {
        if (!data || !user) {
            throw new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        const photoRrepo = this.aspectphotoRepository.create(data);
        const userRepo = this.userHeadRepository.create(user);
        photoRrepo.user = userRepo;
        try {
            const data = await this.aspectphotoRepository.save(photoRrepo);
            return data.toResponceId();
        } catch (e) {
            throw new HttpException('save error', 200);
        }

    }
    async deletePhoto(data: AspectPhoto, user: User): Promise<DeleteResult> {
        if (!data || !user) {
            throw new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.aspectphotoRepository.delete({ userId: user.id, id: data.id });
        } catch (e) {
            throw new HttpException('delete error', 200);
        }

    }

    async deletePhotoByAspect(data: Aspect, user: User): Promise<DeleteResult> {
        if (!data || !user) {
            throw new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.aspectphotoRepository.delete({ userId: user.id, aspectId: data.id });
        } catch (e) {
            throw new HttpException('delete error', 200);
        }

    }

    async getPhotoByAspect(data: Aspect, user: User): Promise<AspectPhoto[]> {
        if (!data || !user) {
            throw new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.aspectphotoRepository.find({
                select: ['id', 'name', 'type', 'size', 'photo', 'aspectId'],
                where: { userId: user.id, aspectId: data.id }
            });
        } catch (e) {
            throw new HttpException('delete error', 200);
        }

    }

    async getPhotoById(data: AspectPhoto, user: User): Promise<AspectPhoto> {
        if (!data || !user) {
            throw new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.aspectphotoRepository.findOne({
                select: ['id', 'name', 'type', 'size', 'photo', 'aspectId'],
                where: { userId: user.id, id: data.id }
            });

        } catch (e) {
            throw new HttpException('delete error', 200);
        }

    }
}