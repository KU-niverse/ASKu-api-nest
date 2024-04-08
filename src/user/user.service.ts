import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateNickname(
    nickname: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOneBy({ nickname });
    if (!user) {
      throw new Error('해당하는 유저가 존재하지 않습니다.');
    }
    user.nickname = nickname;
    await this.userRepository.save(user);
    return {
      success: true,
      message: `닉네임 변경에 성공하였습니다.`,
    };
  }
}
