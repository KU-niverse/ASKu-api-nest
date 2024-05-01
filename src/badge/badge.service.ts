import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';
import { BadgeHistory } from './entities/badgeHistory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(BadgeHistory)
    private badgHistoryRepository: Repository<BadgeHistory>,
  ) {}
  async getBadgeAll(): Promise<Badge[]> {
    const badges = await this.badgeRepository
      .createQueryBuilder('badges')
      .leftJoin(
        'badge_history',
        'badge_history',
        'badges.id = badge_history.badge_id',
      )
      .select(['badges.*', 'COUNT(badge_history.id) AS history_count'])
      .groupBy(
        'badges.id, badges.name, badges.image, badges.description, badges.event, badges.cont',
      )
      .orderBy('history_count', 'ASC')
      .addOrderBy('badges.id', 'ASC')
      .getRawMany();

    return badges;
  }

  async getBadgeHistoryByUserId(userId: number): Promise<BadgeHistory[]> {
    const result: BadgeHistory[] = await this.badgHistoryRepository.find({
      where: { userId },
      relations: ['badge'],
    });
    return result;
  }
}
