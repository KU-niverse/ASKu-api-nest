import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadgeModule } from 'src/badge/badge.module';
import { UserAction } from 'src/user/entities/userAction.entity';
import { UserAttend } from 'src/user/entities/userAttend.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Badge } from 'src/badge/entities/badge.entity';
import { UserRepository } from './user.repository';
import { AiSession } from 'src/ai/entities/aiSession.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAttend, UserAction, Badge, AiSession]),
    forwardRef(() => BadgeModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [TypeOrmModule, UserService, UserRepository],
})
export class UserModule {}
