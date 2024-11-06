import { ApiProperty } from '@nestjs/swagger';

export class SearchKeywordDto {
  @ApiProperty({ description: '키워드(검색어)' })
  keyword: string;

  @ApiProperty({ description: '30일 내 검색 횟수' })
  count: number;
}