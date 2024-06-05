import { ApiProperty } from '@nestjs/swagger';

export class EditWikiDto {
  @ApiProperty()
  new_content: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  is_q_based: 0 | 1;

  @ApiProperty()
  qid: number;

  @ApiProperty()
  index_title: string;
}
