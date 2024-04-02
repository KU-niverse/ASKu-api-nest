import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debate } from 'src/debate/entities/debate.entity';
import { DebateHistory } from 'src/debate/entities/debateHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Debate, DebateHistory])],
})
export class DebateModule {}
