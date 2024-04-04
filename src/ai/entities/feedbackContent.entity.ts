import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Feedback } from 'src/ai/entities/feedback.entity';

@Entity('feedback_content')
export class FeedbackContent extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '피드백 내용의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '피드백 ID' })
  feedbackId: number;

  @ManyToOne(() => Feedback, { nullable: false })
  @JoinColumn({ name: 'feedback_id' })
  feedback: Feedback;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '피드백 내용' })
  content: string;
}
