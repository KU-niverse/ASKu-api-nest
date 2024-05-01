import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { Badge } from './badge.entity';

@Entity('badge_history')
export class BadgeHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '뱃지 기록의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '뱃지를 획득한 사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '획득한 뱃지 ID' })
  badgeId: number;

  @ManyToOne(() => Badge, { nullable: false })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[부적절한 뱃지 획득 기록인지 여부] 0: 적절, 1: 부적절',
    default: false,
  })
  isBad: boolean;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '뱃지 획득 기록 생성 시간', type: String })
  createdAt: Date;
}
