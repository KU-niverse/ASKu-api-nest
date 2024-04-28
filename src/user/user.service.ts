import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KoreapasCredentialsDto } from 'src/auth/dto/koreapas-credential.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserByUuid(koreapasUuid: string): Promise<User> {
    return await this.userRepository.findOne({ where: { uuid: koreapasUuid } });
  }

  async getUserById(userId: number): Promise<User> {
    const result: User = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!result) {
      throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다.');
    }
    return result;
  }
}
