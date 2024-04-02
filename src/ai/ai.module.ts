import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHistory } from 'src/ai/entities/aiHistory.entity';
import { AiSession } from 'src/ai/entities/aiSession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiSession, AiHistory])],
})
export class AiModule {}
