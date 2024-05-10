import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserRepBadgeDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  badgeId: number;
}
