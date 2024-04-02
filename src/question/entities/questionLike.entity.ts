import {
  Entity,
  PrimaryColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Question } from 'src/question/entities/question.entity';

import { User } from 'src/user/user.entity';

@Entity('question_like')
export class QuestionLike extends BaseEntity {
  @PrimaryColumn({ type: 'int' })
  @ApiProperty({ description: '질문 ID' })
  id: number;

  @ManyToOne(() => Question, { nullable: false })
  @JoinColumn({ name: 'id' })
  question: Question;

  @PrimaryColumn({ type: 'int' })
  @ApiProperty({ description: '좋아요를 누른 유저 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
