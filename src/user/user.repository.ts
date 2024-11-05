import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getTotalUsers(): Promise<number> {
    return this.userRepository.count({
      where: { isDeleted: false },
    });
  }

  async getUserRankingAndPoint(userId: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .select('user.point', 'user_point')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*) + 1')
            .from(User, 'u')
            .where('u.point > user.point'),
        'ranking',
      )
      .where('user.id = :userId', { userId })
      .getRawOne();
  }

  // // user.repository.ts에 추가
  // async editNick(nickname: string, userId: number): Promise<boolean> {
  //   try {
  //     // 닉네임 중복 체크
  //     const existingUser = await this.userRepository.findOne({
  //       where: { nickname, id: Not(userId) },
  //     });
  //
  //     if (existingUser) {
  //       return false;
  //     }
  //
  //     const result = await this.userRepository
  //       .createQueryBuilder()
  //       .update(User)
  //       .set({ nickname })
  //       .where('id = :id', { id: userId })
  //       .execute();
  //
  //     return result.affected > 0;
  //   } catch (error) {
  //     console.error('editNick 레포지토리에서 오류가 발생했습니다:', error);
  //     return false;
  //   }
  // }
}
