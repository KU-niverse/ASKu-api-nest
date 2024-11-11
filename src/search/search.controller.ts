import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchHistory } from './entities/searchHistory.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('popular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '인기 검색어 조회 (최근 24시간 기준)',
    description: 'GET 방식으로 최근 24시간 기준 인기 검색어를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '검색어 조회 성공',
    type: SearchHistory,
  })
  @ApiResponse({
    status: 500,
    description: '검색어 조회 중 오류 발생',
  })
  async popularRankGetMid(): Promise<any> {
    const ranks = await this.searchService.getKeywordRank();
    return {
      success: true,
      message: '인기순 검색어를 조회하였습니다.',
      data: ranks,
    };
  }
}
