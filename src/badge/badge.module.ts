import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from 'src/badge/entities/badge.entity';

import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Badge]), forwardRef(() => UserModule)],
  controllers: [BadgeController],
  providers: [BadgeService],
  exports: [TypeOrmModule, BadgeService],
})

export class BadgeModule {}
