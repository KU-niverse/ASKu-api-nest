import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('report_type')
export class ReportType extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '보고서 타입의 고유 식별자' })
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @ApiProperty({ description: '보고서 설명', maxLength: 20 })
  description: string;
}
