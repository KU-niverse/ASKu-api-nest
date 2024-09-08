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

import {
  IncorrectIdPwException,
  LeaveUserException,
  KoreapasLoginException,
  UserAlreadyExistException,
  KoreapasRestrictedUserException,
} from 'src/common/exceptions/auth.exception';
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

  async signUp(
    koreapasCredentialsDto: KoreapasCredentialsDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { uuid, nickname } = koreapasCredentialsDto;

    // 고파스 로그인 api를 통해 받아온 uuid로 이미 존재하는 유저인지 확인
    const user = await this.userService.getUserByUuid(uuid);

    // 이미 존재하는 유저일경우 에러 발생
    if (user) {
      throw new UserAlreadyExistException(
        '회원가입에 실패하였습니다. 중복된 항목이 있습니다.',
      );
    }
    // 들어온 정보를 가지고 유저를 생성
    const createdUser: User = await this.userService.createUser(uuid, nickname);
    // 생성된 유저에 대해 출석 체크 로직 실행
    await this.userService.markUserAttend(createdUser.id);
    // jwt 발급 및 반환
    return this.getJwt(createdUser.id);
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
      throw new LeaveUserException('탈퇴한 회원입니다.');
    } else if (new Date(user.restrictPeriod) > today) {
      throw new ForbiddenException('이용이 제한된 회원입니다.');
    }
  }

  async validateKoreapasCredentials(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ uuid: string; nickname: string }> {
    const { login_id, password } = authCredentialsDto;
    const res = await axios.post(
      `https://www.koreapas.com/bbs/login_api.php?user_id=${encodeURIComponent(login_id)}&password=${encodeURIComponent(password)} &api_key=${process.env.KOREAPAS_API_KEY}`,
      {},
    );

    if (res.status == 200) {
      if (res.data.result == true) {
        const uuid: string = res.data.data.uuid;
        const nickname: string = res.data.data.nickname;
        return { uuid, nickname };
      }
      if (res.data.result == false) {
        throw new IncorrectIdPwException(
          '아이디와 비밀번호를 다시 확인해주세요',
        );
      }
    }
    if (res.status != 200) {
      throw new UnauthorizedException('고파스 로그인 api 서버 에러');
    }
  }

  getJwt(userId: number): { accessToken: string; refreshToken: string } {
    const payload = { id: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
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
    // 출석 체크
    await this.userService.markUserAttend(user.id);

    // 현재 db상의 닉네임과 고파스 db간의 닉네임 차이 동기화
    await this.syncNickname(user, nickname);
    // 유저 탈퇴 여부, 이용 제한 여부 확인
    await this.validateUser(user);
    // jwt 발급 및 반환
    return this.getJwt(user.id);
  }

  async signOut(): Promise<void> {
    // 로그아웃 시 추가적인 작업이 필요한 경우 여기에 구현할 수 있습니다.
    // 예를 들어, 사용자 세션 정보를 삭제하거나 로그를 기록하는 등의 작업을 수행할 수 있습니다.
  }

  getUserByUuid(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { uuid } });
  }

  async koreapasOAuth(uuid: string): Promise<{
    is_registered: boolean;
    koreapas_nickname: string | null;
    koreapas_uuid: string | null;
    user_id: number | null;
  }> {
    console.log('🚀 ~ AuthService ~ koreapasOAuth ~ uuid:', uuid);
    // koreapas api를 통해 uuid로 유저 정보를 받아옴
    const response = await axios.get(
      `https://www.koreapas.com/bbs/valid_api.php?api_key=${process.env.KOREAPAS_API_KEY}&uuid=${uuid}`,
    );
    console.log(
      '🚀 ~ AuthService ~ koreapasOAuth ~ response:',
      response.data.data,
    );

    // result가 false라면 reject
    if (response.data.result == false) {
      throw new UnauthorizedException('유효하지 않은 접근입니다.');
    }

    const { uuid: koreapas_uuid, nickname, level } = response.data.data;
    console.log(
      '🚀 ~ AuthService ~ koreapasOAuth ~ koreapas_uuid:',
      koreapas_uuid,
    );
    // 9, 10 -> 강등 또는 미인증 상태의 유저
    if (level > 8) {
      throw new KoreapasRestrictedUserException(
        '강등 또는 미인증 상태의 유저입니다.',
      );
    }

    const user: User | null = await this.getUserByUuid(koreapas_uuid);
    console.log('🚀 ~ AuthService ~ koreapasOAuth ~ user:', user);
    // 고파스 uuid로 등록된 유저가 없다면 reject
    if (user == null) {
      return {
        is_registered: false,
        koreapas_nickname: nickname,
        koreapas_uuid: uuid,
        user_id: null,
      };
    }

    await this.userService.markUserAttend(user.id);
    // 고파스 uuid가 ASKu DB에 이미 등록된 유저라면 로그인 처리
    return {
      is_registered: true,
      koreapas_nickname: null,
      koreapas_uuid: null,
      user_id: user.id,
    };
  }
}
