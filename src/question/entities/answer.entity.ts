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
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { Question } from 'src/question/entities/question.entity';

@Entity('answers')
export class Answer extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '답변의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '해당 답변과 매치되는 wiki_history ID' })
  wikiHistoryId: number;

  @ManyToOne(() => WikiHistory, { nullable: false })
  @JoinColumn({ name: 'wiki_history_id' })
  wikiHistory: WikiHistory;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '질문 ID' })
  questionId: number;

  @ManyToOne(() => Question, { nullable: false })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '답변 생성 시간', type: String })
  createdAt: Date;
}
