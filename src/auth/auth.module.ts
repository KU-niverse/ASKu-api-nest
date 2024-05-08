import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      }),
    }),
    UserModule,
    // TypeOrmModule.forFeature([User, UserAttend, UserAction]),
  ],
  controllers: [AuthController],
  // authmodule에서 사용하기 위함
  providers: [AuthService, JwtStrategy],
  // 다른 모듈에서 이용하기 위함
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
