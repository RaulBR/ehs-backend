import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';
import { AspectPhoto, Aspect } from 'src/modules/audits/audit_aspect/aspect.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class PhotoService {

    constructor(
        @InjectRepository(User) private readonly userHeadRepository: Repository<User>,    
        @InjectRepository(AspectPhoto) private readonly aspectphotoRepository: Repository<AspectPhoto>) { }

    async setPhoto(data: AspectPhoto, user: User) {
        if (!data || !user) {
            return new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        let photoRrepo = this.aspectphotoRepository.create(data);
        const userRepo = this.userHeadRepository.create(user);
        photoRrepo.user = userRepo;
        try {
            return await (await this.aspectphotoRepository.save(photoRrepo)).toResponceId();
        } catch (e) {
            return new HttpException('save error', 200);
        }

    }

    async deletePhoto(data: AspectPhoto, user: any) {
        if (!data || !user) {
            return new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.aspectphotoRepository.delete({ userId: user.id, id: data.id });
        } catch (e) {
            return new HttpException('delete error', 200);
        }

    }

    async deletePhotoByAspect(data: Aspect, user: any) {
        if (!data || !user) {
            return new HttpException('No data', HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.aspectphotoRepository.delete({ userId: user.id, aspectId: data.id });
        } catch (e) {
            return new HttpException('delete error', 200);
        }

    }

    async getPhotoByAspect(data: Aspect, user: any): Promise<AspectPhoto[]> {
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

    async getPhotoById(data: AspectPhoto, user: any): Promise<AspectPhoto> {
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