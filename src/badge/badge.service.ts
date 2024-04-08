import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BadgeService {
    constructor(
        @InjectRepository(Badge)
        private badgeRepository: Repository<Badge>,
    ) {}
    async getMyBadgeAll(id: number): Promise<Badge> {
        const result =  await this.badgeRepository.findOne({ where: { id } });
        if(!result)
        {
            throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다')
        }
        return result;
    }
}

