import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeHistory } from 'src/badge/entities/badgeHistory.entity';
import { Badge } from 'src/badge/entities/badge.entity';

import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, BadgeHistory])],
  controllers: [BadgeController],
  providers: [BadgeService],
})
export class BadgeModule {}
