import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AiSession } from 'src/ai/entities/aiSession.entity';

@Entity('ai_history')
export class AiHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'AI 이력의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '세션 ID' })
  sessionId: number;

  @ManyToOne(() => AiSession, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: AiSession;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '질문 내용' })
  qContent: string;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '답변 내용' })
  aContent: string;

  @Column('text', { nullable: true })
  @ApiProperty({ description: '출처 텍스트', nullable: true })
  reference: string | null;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '생성된 시간', type: String })
  createdAt: Date;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[히스토리 초기화 여부] 0: 존재, 1: 삭제(초기화)된 히스토리',
    default: false,
  })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: '질문이 요청된 시각', nullable: true })
  requestedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: '질문이 처리된 시각', nullable: true })
  responsedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ description: '총 대기 시간', nullable: true })
  latencyTime: number | null;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({ description: '피드백 여부', default: false })
  hasFeedback: boolean;
}
