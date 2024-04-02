import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_attend')
export class UserAttend extends BaseEntity {
  @PrimaryColumn({ type: 'int' })
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[일일 출석 여부] false: 오늘 출석 안 함, true: 오늘 출석함',
    default: false,
  })
  todayAttend: boolean;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '연속 출석 일수', default: 0 })
  contAttend: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '총 출석 일수', default: 0 })
  totalAttend: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '최대 연속 출석 일수', default: 0 })
  maxAttend: number;
}
