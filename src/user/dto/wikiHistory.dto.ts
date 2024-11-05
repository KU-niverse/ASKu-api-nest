// src/user/dto/wiki-history.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';

export class WikiHistoryDto {
  @ApiProperty({
    example: 1,
    description: '위키 히스토리 ID',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: '문서 ID',
  })
  doc_id: number;

  @ApiProperty({
    example: 1,
    description: '사용자 ID',
  })
  user_id: number;

  @ApiProperty({
    example: '한국사',
    description: '위키 문서 제목',
  })
  title: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: '생성 일자',
  })
  created_at: Date;
}

export class WikiHistoryResponseDto {
  @ApiProperty({
    example: true,
    description: '요청 성공 여부',
  })
  success: boolean;

  @ApiProperty({
    type: [WikiHistory],
    description: '위키 히스토리 목록',
  })
  data: WikiHistory[];

  @ApiProperty({
    example: '위키 히스토리를 불러오는데 성공했습니다.',
    description: '응답 메시지',
  })
  message: string;
}
