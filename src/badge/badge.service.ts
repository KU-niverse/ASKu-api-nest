import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeHistory } from './entities/badgeHistory.entity';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(BadgeHistory)
    private badgHistoryRepository: Repository<BadgeHistory>,
  ) {}

  async getBadgeHistoryByUserId(userId: number): Promise<BadgeHistory[]> {
    const result: BadgeHistory[] = await this.badgHistoryRepository.find({
      where: { userId },
      relations: ['badge'],
    });
    return result;
  }
}
