import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Badge } from 'src/badge/entities/badge.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '유저의 고유 식별자' })
  id: number;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  @ApiProperty({ description: '유저 닉네임', maxLength: 30 })
  nickname: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  @ApiProperty({ description: '유저의 대표 배지 ID', nullable: true })
  repBadge: number | null;

  @ManyToOne(() => Badge, { nullable: true })
  @JoinColumn({ name: 'rep_badge' })
  @ApiProperty({
    description: '대표 배지의 ID (기본값: 16, 없을 경우 null 가능)',
    nullable: true,
    default: 16,
  })
  badge: Badge | null;

  @CreateDateColumn({
    nullable: false,
  })
  @ApiProperty({ description: '계정 생성 시간', type: String })
  createdAt: Date;

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  @ApiProperty({ description: '유저 포인트 (기본값: 0)', default: 0 })
  point: number;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description: '[유저 종류] false: 일반 유저, true: 관리자 유저',
    default: false,
  })
  isAdmin: boolean;

  @Column({
    type: 'date',
    nullable: true,
  })
  @ApiProperty({ description: '이용 제한 기한', nullable: true, type: String })
  restrictPeriod: Date | null;

  @Column({
    type: 'tinyint',
    default: 0,
    nullable: false,
  })
  @ApiProperty({ description: '이용 제한 횟수 (기본값: 0)', default: 0 })
  restrictCount: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  @ApiProperty({ description: '식별을 위한 UUID', maxLength: 255 })
  uuid: string;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description: '[탈퇴 여부] false: 존재 회원, true: 탈퇴 회원',
    default: false,
  })
  isDeleted: boolean;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description:
      '[인증된 유저 여부] false: 인증되지 않은 유저, true: 인증된 유저',
    default: false,
  })
  isAuthorized: boolean;
}
