import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('wiki_docs')
export class WikiDoc extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '위키 문서의 고유 식별자' })
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  @ApiProperty({ description: '문서 제목', maxLength: 100 })
  title: string;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '텍스트 포인터' })
  textPointer: string;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '최근 필터링된 내용' })
  recentFilteredContent: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  @ApiProperty({ description: '최신 버전 번호' })
  latestVer: number;

  @Column({
    type: 'enum',
    enum: ['doc', 'list'],
    nullable: false,
  })
  @ApiProperty({
    description: '[문서 타입] doc: 목차형, list: 나열형',
    enum: ['doc', 'list'],
  })
  type: 'doc' | 'list';

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description: '[문서 삭제 여부] 0: 존재하는 문서, 1: 삭제한 문서',
    default: false,
  })
  isDeleted: boolean;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '문서 생성 시간', type: String })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  @ApiProperty({ description: '문서 최종 업데이트 시간', type: String })
  updatedAt: Date;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description: '[관리 문서 여부] 0: 일반 문서, 1: 관리 문서',
    default: false,
  })
  isManaged: boolean;
}
