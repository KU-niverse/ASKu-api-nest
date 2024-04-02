import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { NotificationType } from 'src/notification/entities/notificationType.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '알림의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '알림 유형 ID' })
  typeId: number;

  @ManyToOne(() => NotificationType, { nullable: false })
  @JoinColumn({ name: 'type_id' })
  type: NotificationType;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({ description: '[읽음 여부]', default: false })
  readOrNot: boolean;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @ApiProperty({ description: '메시지 내용', maxLength: 255 })
  message: string;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '알림 생성 시간', type: String })
  createdAt: Date;
}
