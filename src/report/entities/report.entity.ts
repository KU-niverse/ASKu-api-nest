import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { ReportType } from 'src/report/entities/reportType.entity';
import { ReportReason } from 'src/report/entities/reportReason.entity';

@Entity('reports')
export class Report extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '신고의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '신고한 유저 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '신고 종류 ID' })
  typeId: number;

  @ManyToOne(() => ReportType, { nullable: false })
  @JoinColumn({ name: 'type_id' })
  type: ReportType;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '신고 대상 ID' })
  target: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '신고 사유 ID' })
  reasonId: number;

  @ManyToOne(() => ReportReason, { nullable: false })
  @JoinColumn({ name: 'reason_id' })
  reason: ReportReason;

  @Column('text', { nullable: true })
  @ApiProperty({ description: '신고 추가 정보', nullable: true })
  comment: string | null;

  @Column({ type: 'tinyint', nullable: false, default: 0 })
  @ApiProperty({
    description: '승인 여부 (0: 미확인, 1: 승인됨, -1: 반려됨)',
    default: 0,
  })
  isChecked: number;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '신고 생성 시간', type: String })
  createdAt: Date;
}
