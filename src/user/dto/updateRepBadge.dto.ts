import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserRepBadgeDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 아이디',
    example: 12,
  })
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '배지 아이디',
    example: 13,
  })
  badgeId: number;
}
