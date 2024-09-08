import { ApiProperty } from '@nestjs/swagger';

export class TotalContributionsListDto {
  constructor(partial: Partial<TotalContributionsListDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  login_id: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  point: number;
}
