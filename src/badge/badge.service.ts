import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeHistory } from './entities/badgeHistory.entity';

@Injectable()
export class BadgeService {
    constructor(
        @InjectRepository(BadgeHistory)
        private badgHistoryRepository: Repository<BadgeHistory>,
    ) {}
    async getMyBadgeHistory(userId: number): Promise<BadgeHistory[]> {
        const result =  await this.badgHistoryRepository.find({ where: { userId } });
        if(result.length === 0)
        {
            throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다')
        }
        return result;
    }
}

