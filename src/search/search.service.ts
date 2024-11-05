import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './entities/searchHistory.entity';
import { SearchKeywordDto } from './dto/get-search-history.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async getKeywordRank(): Promise<SearchKeywordDto[]> {
    const results = await this.searchHistoryRepository.query(
      `SELECT keyword, COUNT(*) as count 
       FROM search_history
       WHERE TIMESTAMPDIFF(DAY, search_time, NOW()) <= 30
       GROUP BY keyword 
       ORDER BY count DESC 
       LIMIT 5`,
    );
  return results.map(result => ({
    keyword: result.keyword,
    count: Number(result.count),
    }));
  }
}