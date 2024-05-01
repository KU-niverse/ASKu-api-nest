import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiHistory)
    private wikiRepository: Repository<WikiHistory>,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    const wikiHistory: WikiHistory[] = await this.wikiRepository.find({
      where: { userId },
      relations: ['wikiDoc'],
    });
    return wikiHistory;
  }
}
