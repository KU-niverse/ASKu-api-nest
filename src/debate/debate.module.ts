import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debate } from 'src/debate/debate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Debate])],
})
export class DebateModule {}
