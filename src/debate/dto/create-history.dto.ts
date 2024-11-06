import { ApiProperty } from '@nestjs/swagger';

export class CreateHistoryDto {
  @ApiProperty({ description: '메시지 내용', default: "" })
  content: string;
}