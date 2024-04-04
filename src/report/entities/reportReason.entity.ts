import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('report_reason')
export class ReportReason extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '신고 사유의 고유 식별자' })
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @ApiProperty({ description: '신고 사유 설명', maxLength: 20 })
  description: string;
}
