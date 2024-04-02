import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHistory } from 'src/ai/entities/aiHistory.entity';
import { AiSession } from 'src/ai/entities/aiSession.entity';
import { Feedback } from 'src/ai/entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiSession, AiHistory, Feedback])],
})
export class AiModule {}
