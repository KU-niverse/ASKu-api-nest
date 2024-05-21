import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from 'src/question/entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';
import { QuestionLike } from 'src/question/entities/questionLike.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { AuthModule } from 'src/auth/auth.module';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, User, WikiDoc, QuestionLike, Answer]),
    AuthModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
