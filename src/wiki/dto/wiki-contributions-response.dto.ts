import { ApiProperty } from '@nestjs/swagger';

// 기여자 = 사용자
export class WikiContributionsDto {
  @ApiProperty({ description: '기여자 ID' })
  user_id: number;

  @ApiProperty({ description: '기여자 닉네임' })
  nickname: string;

  @ApiProperty({ description: '문서 내 기여자 포인트' })
  point: number;
}

/*
import { ApiProperty } from '@nestjs/swagger';

class ContributorDto {
    @ApiProperty({ description: '사용자 ID' })
    user_id: number;
  
    @ApiProperty({ description: '사용자 닉네임' })
    nickname: string;
    
    @ApiProperty({ description: '문서 내 사용자 포인트' })
    point: number;
  }

export class WikiContributionsDto {
  @ApiProperty({ type: [ContributorDto], description: '기여자 목록' })
  contributions: ContributorDto[];
}
*/