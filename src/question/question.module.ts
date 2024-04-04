import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from 'src/question/entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';
import { QuestionLike } from 'src/question/entities/questionLike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, QuestionLike])],
})
export class QuestionModule {}
