import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '배지의 고유 식별자' })
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  @ApiProperty({ description: '배지의 이름', maxLength: 20 })
  name: string;

  @Column('text')
  @ApiProperty({ description: '로컬에 저장된 배지 이미지의 링크' })
  image: string;

  @Column('text')
  @ApiProperty({ description: '배지에 대한 설명' })
  description: string;

  @Column({
    type: 'bool',
    default: 0,
  })
  @ApiProperty({ description: '[배지의 특성] 0: 일반, 1: 이벤트', default: 0 })
  event: boolean;

  @Column({
    type: 'bool',
    default: 0,
  })
  @ApiProperty({ description: '[배지의 특성] 0: 단일, 1: 연속', default: 0 })
  cont: boolean;
}
