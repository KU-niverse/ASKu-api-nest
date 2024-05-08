import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadgeModule } from 'src/badge/badge.module';
import { UserAction } from 'src/user/entities/userAction.entity';
import { UserAttend } from 'src/user/entities/userAttend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAttend, UserAction]),
    BadgeModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
