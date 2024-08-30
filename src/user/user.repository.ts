import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
