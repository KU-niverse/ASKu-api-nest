import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    const wikiHistory: WikiHistory[] = await this.wikiHistoryRepository.find({
      where: { userId: userId },
      relations: ['wikiDoc'],
    });
    return wikiHistory;
  }
}
