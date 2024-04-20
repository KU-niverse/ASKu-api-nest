import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserInfoById(userId: number): Promise<User> {
    const result = (await this.userRepository.findOne({
      where: { id: userId },
    })) as User;
    if (!result) {
      throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다.');
    }
    return result;
  }
}
