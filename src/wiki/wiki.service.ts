import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    const wikiHistory: WikiHistory[] = await this.wikiHistoryRepository.find({
      where: { userId: userId },
      relations: ['wikiDoc'],
    });
    return wikiHistory;
  }

  async recalculatePoint(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const point = await this.wikiHistoryRepository
        .createQueryBuilder('history')
        .select('SUM(CASE WHEN history.diff > 0 AND history.isQBased = 1 THEN history.diff * 5 WHEN history.diff > 0 THEN history.diff * 4 ELSE 0 END)', 'point')
        .where('history.userId = :userId', { userId })
        .andWhere('history.isBad = 0')
        .andWhere('history.isRollback = 0')
        .getRawOne();

    user.point = point.point || 0;
    await this.userRepository.save(user);

    return user.point;
}

}
