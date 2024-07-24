import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserRepBadgeDto {
  @IsNumber()
  @IsNotEmpty()
  badgeId: number;
}
