import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationType } from 'src/notification/entities/notificationType.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationType, Notification]),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
