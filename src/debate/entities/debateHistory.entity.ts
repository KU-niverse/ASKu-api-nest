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
import { Debate } from 'src/debate/entities/debate.entity';
import { User } from 'src/user/user.entity';

@Entity('debate_history')
export class DebateHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '토론 기록의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '토론 ID' })
  debateId: number;

  @ManyToOne(() => Debate, { nullable: false })
  @JoinColumn({ name: 'debate_id' })
  debate: Debate;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '기록을 남긴 사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '기록 내용' })
  content: string;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[부적절한 기록 여부] 0: 적절, 1: 부적절',
    default: false,
  })
  isBad: boolean;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '기록 생성 시간', type: String })
  createdAt: Date;
}
