import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidSessionIDException extends HttpException {
  constructor() {
    super('Invalid session id', HttpStatus.BAD_REQUEST);
  }
}
