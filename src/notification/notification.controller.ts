import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/user/:userId')
  // TODO: isSignedIn 대용 guard 필요
  @ApiOperation({ summary: '유저 알림 조회' })
  @ApiResponse({
    status: 200,
    description: '유저 알림 목록을 조회하였습니다.',
    type: [Notification],
  })
  @ApiResponse({ status: 500, description: '오류가 발생하였습니다.' })
  async getUserNotifications(
    @Param('userId') userId: number,
  ): Promise<Notification[]> {
    return this.notificationService.getNotificationsByRole(userId, false);
  }

  @Get('/admin/:userId')
  // TODO: isSignedIn, isAdmin 대용 guard 필요
  @ApiOperation({ summary: '관리자 알림 조회' })
  @ApiResponse({
    status: 200,
    description: '관리자 알림 목록을 조회하였습니다.',
    type: [Notification],
  })
  @ApiResponse({ status: 500, description: '오류가 발생하였습니다.' })
  async getAdminNotifications(
    @Param('userId') userId: number,
  ): Promise<Notification[]> {
    return this.notificationService.getNotificationsByRole(userId, true);
  }

  @Post('/read')
  @HttpCode(200)
  @ApiOperation({ summary: '알림 읽음 표시' })
  @ApiBody({
    description: '알림 id',
    type: Number,
    examples: {
      example1: {
        summary: '알림 id',
        value: { notificationId: 123 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '알림을 읽음 표시하였습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '이미 읽음 표시한 알림입니다.',
  })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없습니다.' })
  @ApiResponse({ status: 500, description: '오류가 발생하였습니다.' })
  async markNotificationAsRead(
    @Body('notificationId') notificationId: number,
  ): Promise<Notification> {
    try {
      return await this.notificationService.markAsRead(notificationId);
    } catch (error) {
      if (error.message === 'Notification not found') {
        throw new HttpException(
          '알림을 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.message === 'Notification already marked as read') {
        throw new HttpException(
          '이미 읽음 표시한 알림입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        '오류가 발생하였습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
