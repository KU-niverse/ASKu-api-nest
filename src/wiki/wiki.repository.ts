import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';

@Injectable()
export class WikiRepository {
  constructor(
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    return this.wikiHistoryRepository.find({
      where: { userId: userId },
      relations: ['wikiDoc'],
    });
  }

  async getDocsContributions(userId: number, userPoint: number) {
    return this.wikiHistoryRepository
      .createQueryBuilder('wh')
      .select('wh.docId', 'doc_id')
      .addSelect('wd.title', 'doc_title')
      .addSelect(
        'SUM(CASE WHEN wh.diff > 0 AND wh.isQBased = 1 THEN wh.diff * 5 ' +
          'WHEN wh.diff > 0 THEN wh.diff * 4 ELSE 0 END)',
        'doc_point',
      )
      .addSelect(
        'CAST(SUM(CASE WHEN wh.diff > 0 AND wh.isQBased = 1 THEN wh.diff * 5 ' +
          'WHEN wh.diff > 0 THEN wh.diff * 4 ELSE 0 END) / :totalPoint * 100 AS DECIMAL(5,4))',
        'percentage',
      )
      .innerJoin('wh.wikiDoc', 'wd')
      .where('wh.userId = :userId', { userId })
      .andWhere('wh.isBad = 0')
      .andWhere('wh.isRollback = 0')
      .groupBy('wh.docId')
      .addGroupBy('wd.title')
      .orderBy('doc_point', 'DESC')
      .setParameter('totalPoint', userPoint)
      .getRawMany();
  }
}
