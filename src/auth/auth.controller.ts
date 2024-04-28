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
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credential.dto';
import { KoreapasCredentialsDto } from 'src/auth/dto/koreapas-credential.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // TODO: Refresh Token 구현
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.signIn(authCredentialsDto);

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

    return;
  }

  // @Post('/signup')
  // @HttpCode(HttpStatus.CREATED)
  // async signUp(
  //   @Body(ValidationPipe) koreapasCredentialsDto: KoreapasCredentialsDto,
  // ): Promise<void> {
  //   return this.authService.signUp(koreapasCredentialsDto);
  // }

  @Get('/signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async signOut(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    response.set('Cache-Control', 'no-store');
    return;
  }
}
