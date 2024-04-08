import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeHistory } from './entities/badgeHistory.entity';
import { Badge } from './entities/badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, BadgeHistory])],
  controllers: [],
  providers: [],
})
export class BadgesModule {}
