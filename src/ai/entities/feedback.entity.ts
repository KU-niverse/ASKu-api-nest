import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AiHistory } from 'src/ai/entities/aiHistory.entity';

@Entity('feedback')
export class Feedback extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '피드백의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'AI 히스토리 ID' })
  qnaId: number;

  @ManyToOne(() => AiHistory, { nullable: false })
  @JoinColumn({ name: 'qna_id' })
  aiHistory: AiHistory;

  @Column({ type: 'bool', nullable: false })
  @ApiProperty({
    description: '[평가] false: 좋아요, true: 나빠요',
    default: false,
  })
  feedback: boolean;
}
