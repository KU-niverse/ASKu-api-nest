import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KoreapasCredentialsDto } from 'src/auth/dto/koreapas-credential.dto';
import { User } from 'src/user/entities/user.entity';
import { UserAction } from 'src/user/entities/userAction.entity';
import { UserAttend } from 'src/user/entities/userAttend.entity';
import { Repository } from 'typeorm';
import { BadgeService } from 'src/badge/badge.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAttend)
    private userAttendRepository: Repository<UserAttend>,
    @InjectRepository(UserAction)
    private userActionRepository: Repository<UserAction>,
    private badgeService: BadgeService,
    // private aiService: AiService,
  ) {}

  async insertUserActionRow(userId: number): Promise<void> {
    const userAction = this.userActionRepository.create({
      userId,
    });
    await this.userActionRepository.save(userAction);
  }

  async insertUserAttendRow(userId: number): Promise<void> {
    const userAttend = this.userAttendRepository.create({
      userId,
    });
    await this.userAttendRepository.save(userAttend);
  }

  async markUserAttend(userId: number): Promise<void> {
    const userAttend = await this.userAttendRepository.findOne({
      where: { userId },
    });
    // 오늘 첫 출석이라면
    if (!userAttend.todayAttend) {
      // 연속 출석 일수가 최대 연속 출석 일수보다 크다면 최대 연속 출석일수를 업데이트
      let maxAttend = userAttend.maxAttend;
      if (userAttend.maxAttend < userAttend.contAttend + 1) {
        maxAttend = userAttend.contAttend + 1;
      }
      // 오늘 출석을 했으므로 totalAttend와 contAttend를 1씩 증가시키고 maxAttend를 업데이트
      await this.userAttendRepository.update(
        { userId, todayAttend: false },
        {
          contAttend: userAttend.contAttend + 1,
          totalAttend: userAttend.totalAttend + 1,
          maxAttend,
          todayAttend: true,
        },
      );
    }
    return;
  }

  //새로운 유저의 활동 정보 ai 세션저장을 위한 설정
  async userInit(userId: number): Promise<void> {
    await this.insertUserActionRow(userId);
    await this.insertUserAttendRow(userId);
    //TODO: AIsession 생성 로직 추가
    // await this.aiService.createAiSession(userId);
  }

  async createUser(
    koreapasCredentialsDto: KoreapasCredentialsDto,
  ): Promise<User> {
    const { uuid, nickname } = koreapasCredentialsDto;

    const user: User = this.userRepository.create({
      uuid,
      nickname,
    });

    await this.userRepository.save(user);
    //새로운 유저의 활동 정보 ai 세션저장을 위한 설정
    await this.userInit(user.id);

    return user;
  }

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

  async updateRepBadge(user: User, badgeId: number): Promise<void> {
    // badgeId가 유효한가
    this.badgeService.validateBadgeId(badgeId);

    // 유저의 대표 배지를 수정
    user.repBadge = badgeId;
    await this.userRepository.save(user);
  }
}
