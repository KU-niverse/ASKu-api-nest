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

@Entity('search_history')
export class SearchHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '검색 기록의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '검색한 유저(로그인)의 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @ApiProperty({ description: '검색어' })
  keyword: string;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '검색한 시간', type: String })
  searchTime: Date;
}
