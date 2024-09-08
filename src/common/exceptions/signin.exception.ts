// src/common/exceptions/koreapas-login.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

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
