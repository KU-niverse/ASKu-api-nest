import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credential.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async getUserByUuid(koreapasUuid: string): Promise<User> {
    return this.userRepository.findOne({ where: { uuid: koreapasUuid } });
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  // async validateKoreapasCredentials(
  //   authCredentialsDto: AuthCredentialsDto,
  // ): Promise<boolean> {
  //   const { loginId, password } = authCredentialsDto;
  //   const res = await axios.post(
  //     `https://www.koreapas.com/bbs/login_api.php?user_id=${encodeURIComponent(loginId)}&password=${encodeURIComponent(password)} &api_key=${process.env.KOREAPAS_API_KEY}`,
  //     {},
  //   );

  //   if (res.status == 200) {
  //     if (res.data.result == true) {
  //       const uuid: string = res.data.data.uuid;
  //       const nickname: string = res.data.data.nickname;
  //       const user: User = await getUserByUuid(uuid);
  //       if (!user) {
  //       }
  //       return true;
  //     }
  //     if (res.data.result == false) {
  //       return false;
  //     }
  //   }
  //   if (res.status != 200) {
  //     throw new UnauthorizedException('아이디와 비밀번호를 다시 확인해주세요');
  //   }
  // }

  // async signIn(
  //   authCredentialsDto: AuthCredentialsDto,
  // ): Promise<{ accessToken: string }> {
  //   const { loginId, password } = authCredentialsDto;

  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     // 유저 토큰 생성 ( Secret + Payload )
  //     // 중요한 정보는 넣으면 안됨
  //     const payload = { id: user.id };
  //     const accessToken = await this.jwtService.sign(payload);
  //     return { accessToken };
  //   } else {
  //     throw new UnauthorizedException('login failed');
  //   }
  // }
}
