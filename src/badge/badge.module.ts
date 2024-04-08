import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeHistory } from './entities/badgeHistory.entity';
import { Badge } from './entities/badge.entity';
import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, BadgeHistory])],
  controllers: [BadgeController],
  providers: [BadgeService],
})
export class BadgesModule {}
