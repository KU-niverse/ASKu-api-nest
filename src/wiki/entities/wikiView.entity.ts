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
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('wiki_docs_views')
export class WikiDocsView extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '위키 문서 조회 기록의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '조회된 문서의 ID' })
  docId: number;

  @ManyToOne(() => WikiDoc, { nullable: false })
  @JoinColumn({ name: 'doc_id' })
  doc: WikiDoc;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '조회한 사용자의 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '조회 기록 생성 시간', type: String })
  createdAt: Date;
}
