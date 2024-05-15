import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debate } from 'src/debate/entities/debate.entity';
import { DebateHistory } from 'src/debate/entities/debateHistory.entity';
import { DebateController } from './debate.controller';
import { DebateService } from './debate.service';
import { AuthModule } from 'src/auth/auth.module';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debate, DebateHistory, WikiDoc]),
    AuthModule,
  ],
  controllers: [DebateController],
  providers: [DebateService],
})
export class DebateModule {}
