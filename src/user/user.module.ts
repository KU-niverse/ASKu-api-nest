import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserAttend } from 'src/user/entities/userAttend.entity';

@Module({ imports: [TypeOrmModule.forFeature([User, UserAttend])] })
export class UserModule {}
