import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

@Entity({ name: 'search_history' })
export class SearchHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: '검색 기록의 고유 식별자' })
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    @ApiProperty({ description: '키워드(검색어)' })
    keyword: string;

    @Column({
        nullable: false,
    })
    @ApiProperty({ description: '검색한 시각', type: String })
    search_time: Date;
}