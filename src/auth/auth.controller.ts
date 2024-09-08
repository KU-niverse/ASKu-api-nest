import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credential.dto';
import {
  KoreapasCredentialsDto,
  KoreapasOAuthDto,
} from 'src/auth/dto/koreapas-credential.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { IsNotSignedInValidationPipe } from 'src/auth/pipes/is-not-signed-in-validation.pipe';
import { User } from 'src/user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // TODO: Refresh Token 구현
  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      example: {
        success: true,
        message: '로그인에 성공하였습니다!',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '아이디 비밀번호 오류 - IncorrectIdPwException',
    schema: {
      example: {
        success: false,
        message: '아이디와 비밀번호를 다시 확인해주세요',
      },
    },
  })
  @ApiResponse({
    status: 402,
    description: '고파스 아이디로 최초 로그인 - KoreapasLoginException',
    schema: {
      example: {
        success: false,
        message: '고파스 아이디로 최초 로그인하셨습니다.',
        koreapas_nickname: '이힣히힣',
        koreapas_uuid: '3bc0420d503f6e1d2f2e5cb232abb748',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '이용이 제한된 유저 - ForbiddenUserException',
    schema: {
      example: {
        success: false,
        message: '이용이 제한된 회원입니다.',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.signIn(authCredentialsDto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      //TODO: 개발시에 true로 변경해야 쿠키 작동
      secure: false,
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      //TODO: 개발시에 true로 변경해야 쿠키 작동
      secure: false,
      sameSite: 'none',
    });

    return;
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: KoreapasCredentialsDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
  @ApiResponse({
    status: 400,
    description: '이미 존재하는 사용자',
  })
  async signUp(
    @Body(ValidationPipe) koreapasCredentialsDto: KoreapasCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const { accessToken, refreshToken } = await this.authService.signUp(
      koreapasCredentialsDto,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      //TODO: 개발시에 true로 변경해야 쿠키 작동
      secure: false,
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      //TODO: 개발시에 true로 변경해야 쿠키 작동
      secure: false,
      sameSite: 'none',
    });
    return {
      success: true,
      message: '회원가입 성공',
    };
  }

  @Get('/signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  @UseGuards(AuthGuard())
  async signOut(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('accessToken', {
      httpOnly: true,
      //TODO: 개발시에 true로 변경해야 쿠키 작동
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      //TODO: 개발시에 true로 변경해야 쿠키 작동
      secure: true,
      sameSite: 'none',
    });

    res.set('Cache-Control', 'no-store');
    return;
  }

  // TODO: is-not-signed-in-validation.pipe.ts를 사용하여 로그인 여부를 검사
  @Post('/koreapasoauth')
  @HttpCode(HttpStatus.OK)
  async koreapasOAuth(
    @Body() koreapasOAuthDto: KoreapasOAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void | {
    is_registered: boolean;
    koreapas_nickname: string;
    koreapas_uuid: string;
  }> {
    const { is_registered, koreapas_uuid, koreapas_nickname, user_id } =
      await this.authService.koreapasOAuth(koreapasOAuthDto.uuid);
    if (is_registered == true) {
      const { accessToken, refreshToken } = this.authService.getJwt(user_id);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
      });
    }
    if (is_registered == false) {
      return { is_registered, koreapas_nickname, koreapas_uuid };
    }
  }
}
