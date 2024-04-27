// src/common/exceptions/koreapas-login.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

export class KoreapasLoginException extends HttpException {
  constructor(message: string, koreapasUuid: string, koreapasNickname: string) {
    super(message, HttpStatus.NOT_ACCEPTABLE);
    this.koreapasUuid = koreapasUuid;
    this.koreapasNickname = koreapasNickname;
  }

  koreapasUuid: string;
  koreapasNickname: string;
}
