// src/common/exceptions/koreapas-login.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

// sign in 시 아이디 비밀번호가 틀렸을 때 발생하는 예외
export class IncorrectIdPwException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }

  getResponse() {
    return {
      success: false,
      message: this.message,
    };
  }
}

// sign in 시 이미 탈퇴한 유저일 때 발생하는 예외
export class LeaveUserException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.GONE);
  }

  getResponse() {
    return {
      success: false,
      message: this.message,
    };
  }
}

// sign in 시 고파스 계정으로 최초 로그인할 때 발생하는 예외
export class ForbiddenUserException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }

  getResponse() {
    return {
      success: false,
      message: this.message,
    };
  }
}

// sign in 시 고파스 계정으로 최초 로그인할 때 발생하는 예외
export class KoreapasLoginException extends HttpException {
  constructor(message: string, koreapasUuid: string, koreapasNickname: string) {
    // TODO: 406으로 수정 요함
    super(message, HttpStatus.PAYMENT_REQUIRED);
    this.koreapasUuid = koreapasUuid;
    this.koreapasNickname = koreapasNickname;
  }

  koreapasUuid: string;
  koreapasNickname: string;

  getResponse() {
    return {
      success: false,
      message: this.message,
      koreapas_nickname: this.koreapasNickname,
      koreapas_uuid: this.koreapasUuid,
    };
  }
}

// sign up시 이미 존재하는 사용자일때 발생하는 예외
export class UserAlreadyExistException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }

  getResponse() {
    return {
      success: false,
      message: this.message,
    };
  }
}

// 고파스 내에서 미인증 또는 강등유저일때 발생하는 예외
export class KoreapasRestrictedUserException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }

  getResponse() {
    return {
      success: false,
      message: this.message,
    };
  }
}
