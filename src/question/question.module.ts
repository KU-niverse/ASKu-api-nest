import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from 'src/question/entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';
import { QuestionLike } from 'src/question/entities/questionLike.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { AuthModule } from 'src/auth/auth.module';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { UserModule } from 'src/user/user.module';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { Badge } from 'src/badge/entities/badge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      Answer,
      QuestionLike,
      WikiDoc,
      Badge,
      WikiHistory,
    ]),
    UserModule,
    AuthModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
