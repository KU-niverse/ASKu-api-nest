import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notification_type')
export class NotificationType extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '알림 유형의 고유 식별자' })
  id: number;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '알림 유형 설명' })
  description: string;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[관리자 알림 여부] false: 일반 알림, true: 관리자 알림',
    default: false,
  })
  isAdmin: boolean;
}
