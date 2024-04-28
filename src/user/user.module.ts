import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserAction } from 'src/user/entities/userAction.entity';
import { UserAttend } from 'src/user/entities/userAttend.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAttend, UserAction])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
