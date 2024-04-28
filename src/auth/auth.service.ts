import {
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Response } from 'express';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credential.dto';
import { KoreapasCredentialsDto } from 'src/auth/dto/koreapas-credential.dto';
import { KoreapasLoginException } from 'src/common/exceptions/koreapas-login.exception';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signUp(koreapasCredentialsDto: KoreapasCredentialsDto): Promise<void> {
    const { uuid, nickname } = koreapasCredentialsDto;

    const user = await this.userService.getUserByUuid(uuid);

    if (user) {
      throw new NotAcceptableException('이미 가입된 회원입니다.');
    }

    await this.userRepository.save({
      uuid,
      nickname,
    });
  }

  async updateNickname(user: User, nickname: string): Promise<User> {
    user.nickname = nickname;
    return this.userRepository.save(user);
  }

  async syncNickname(user: User, nickname: string): Promise<void> {
    if (user.nickname != nickname) {
      this.updateNickname(user, nickname);
    }
  }

  async validateUser(user: User): Promise<void> {
    const today = new Date();

    if (user.isDeleted) {
      throw new GoneException('탈퇴한 회원입니다.');
    } else if (new Date(user.restrictPeriod) > today) {
      throw new ForbiddenException('이용이 제한된 회원입니다.');
    }
  }

  async validateKoreapasCredentials(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ uuid: string; nickname: string }> {
    const { loginId, password } = authCredentialsDto;
    const res = await axios.post(
      `https://www.koreapas.com/bbs/login_api.php?user_id=${encodeURIComponent(loginId)}&password=${encodeURIComponent(password)} &api_key=${process.env.KOREAPAS_API_KEY}`,
      {},
    );

    if (res.status == 200) {
      if (res.data.result == true) {
        const uuid: string = res.data.data.uuid;
        const nickname: string = res.data.data.nickname;
        return { uuid, nickname };
      }
      if (res.data.result == false) {
        throw new UnauthorizedException(
          '아이디와 비밀번호를 다시 확인해주세요',
        );
      }
    }
    if (res.status != 200) {
      throw new UnauthorizedException('고파스 로그인 api 서버 에러');
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { uuid, nickname } =
      await this.validateKoreapasCredentials(authCredentialsDto);
    const user: User = await this.userService.getUserByUuid(uuid);

    if (!user) {
      throw new KoreapasLoginException(
        '고파스 아이디로 최초 로그인하셨습니다.',
        uuid,
        nickname,
      );
    }

    await this.syncNickname(user, nickname);
    await this.validateUser(user);

    const payload = { id: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async signOut(): Promise<void> {
    // 로그아웃 시 추가적인 작업이 필요한 경우 여기에 구현할 수 있습니다.
    // 예를 들어, 사용자 세션 정보를 삭제하거나 로그를 기록하는 등의 작업을 수행할 수 있습니다.
  }
}
