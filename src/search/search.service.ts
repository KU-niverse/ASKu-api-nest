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
    // TODO: days 30으로 변경
    const results = await this.searchHistoryRepository
      .createQueryBuilder('search_history')
      .where('TIMESTAMPDIFF(DAY, search_history.search_time, NOW()) <= :days', {
        days: 180,
      })
      .select('search_history.keyword', 'keyword')
      .addSelect('COUNT(search_history.keyword)', 'count')
      .groupBy('search_history.keyword')
      .orderBy('count', 'DESC')
      .limit(12)
      .getRawMany();
    console.log('🚀 ~ SearchService ~ getKeywordRank ~ results:', results);

    return results.map((result) => ({
      keyword: result.keyword,
      count: Number(result.count),
    }));
  }
}
