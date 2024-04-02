import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationType } from 'src/notification/entities/notificationType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationType])],
})
export class NotificationModule {}
