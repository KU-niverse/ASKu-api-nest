import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHistory } from 'src/ai/entities/aiHistory.entity';
import { AiSession } from 'src/ai/entities/aiSession.entity';
import { Feedback } from 'src/ai/entities/feedback.entity';
import { FeedbackContent } from 'src/ai/entities/feedbackContent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiSession, AiHistory, Feedback, FeedbackContent]),
  ],
})
export class AiModule {}
