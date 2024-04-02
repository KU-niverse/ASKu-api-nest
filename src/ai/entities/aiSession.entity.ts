import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/user.entity';

@Entity('ai_session')
export class AiSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'AI 세션의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false, default: 0 })
  @ApiProperty({ description: '질문 중인지 여부 (0: 아님, 1: 예)', default: 0 })
  isQuestioning: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: '처리 중인 질문', nullable: true })
  processingQ: string | null;

  @Column({ type: 'int', nullable: false, default: 5 })
  @ApiProperty({ description: '질문 제한', default: 5 })
  questionLimit: number;
}
