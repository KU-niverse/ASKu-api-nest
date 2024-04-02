import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from 'src/badges/badges.entity';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [],
})
export class BadgesModule {}
