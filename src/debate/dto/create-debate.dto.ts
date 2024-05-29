import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDebateDto {
  @IsString()
  @IsNotEmpty()
  subject: string;
}
