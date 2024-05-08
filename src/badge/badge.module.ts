import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from 'src/badge/entities/badge.entity';

import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { BadgeHistory } from 'src/badge/entities/badgeHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, BadgeHistory])],
  controllers: [BadgeController],
  providers: [BadgeService],
  exports: [TypeOrmModule, BadgeService],
})
export class BadgeModule {}
