import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationType } from 'src/notification/entities/notificationType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationType, Notification])],
})
export class NotificationModule {}
