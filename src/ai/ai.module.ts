import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { aISession } from 'src/ai/entities/aiSession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([aISession])],
})
export class AiModule {}
