import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/notification/entities/notification.entity';

@Injectable()
export class NotificationService {
  // TODO: getUsers, getInfo, createNotice 함수 추가 필요
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // 일반 사용자 또는 관리자 알림 조회
  async getNotificationsByRole(
    userId: number,
    isAdmin: boolean,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId: userId, type: { isAdmin: isAdmin } },
      relations: ['type'],
      order: { createdAt: 'DESC' },
    });
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.readOrNot) {
      throw new Error('Notification already marked as read');
    }

    notification.readOrNot = true;
    await this.notificationRepository.save(notification);
    return notification;
  }
}
