import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationType } from 'src/notification/entities/notificationType.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationType, Notification])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
