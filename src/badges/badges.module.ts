import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeHistory } from 'src/badges/entities/badgeHistory.entity';
import { Badge } from 'src/badges/entities/badges.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, BadgeHistory])],
  controllers: [],
  providers: [],
})
export class BadgesModule {}
