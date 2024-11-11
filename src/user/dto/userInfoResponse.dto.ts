//GET /user/mypage/info API (내 정보 조회) 에서 사용 목적으로 만들었으나 사용하지 않고 임시로 둠

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserInfoResponseDto {
    id: number;
    repBadgeId: number;
    nickname: string;
    createdAt: Date;
    point: number;
    isAdmin: boolean;
    isAuthorized: boolean;
    restrictPeriod: Date;
    restrictCount: number;
    repBadgeName: string;
    repBadgeImage: string;
    name: string;
    stuId: string;
    email: string;
    loginId: string;
  }