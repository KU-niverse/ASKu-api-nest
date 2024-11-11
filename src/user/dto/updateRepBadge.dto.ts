import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserRepBadgeDto {
  @ApiProperty({
    example: 16,
    description: '설정할 대표 배지 ID'
  })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  rep_badge_id: number;

  // getter를 사용하여 badgeId로 접근할 수 있게 함
  get badgeId(): number {
    return this.rep_badge_id;
  }
}