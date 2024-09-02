import { ApiProperty } from '@nestjs/swagger';

class DocContribution {
  @ApiProperty({ description: '문서 ID' })
  doc_id: number;

  @ApiProperty({ description: '문서 제목' })
  doc_title: string;

  @ApiProperty({ description: '문서별 포인트' })
  doc_point: number;

  @ApiProperty({ description: '문서별 기여 비율' })
  percentage: number;
}

export class ContributionsResponseDto {
  @ApiProperty({ description: '전체 사용자 수' })
  count: number;

  @ApiProperty({ description: '사용자 랭킹' })
  ranking: number;

  @ApiProperty({ description: '사용자 총 포인트' })
  point: number;

  @ApiProperty({ description: '사용자 랭킹 백분율' })
  ranking_percentage: number;

  @ApiProperty({ type: [DocContribution], description: '문서별 기여 정보' })
  docs: DocContribution[];
}
