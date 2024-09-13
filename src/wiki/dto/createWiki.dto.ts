import { ApiProperty } from '@nestjs/swagger';

export class CreateWikiDto {
  @ApiProperty()
  text: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  is_q_based: 0 | 1;

  @ApiProperty()
  index_title: string;
}