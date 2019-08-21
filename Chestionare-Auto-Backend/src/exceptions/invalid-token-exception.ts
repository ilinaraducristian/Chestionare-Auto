import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenException extends HttpException {
  constructor() {
    super({ error: 'Invalid token' }, HttpStatus.BAD_REQUEST);
  }
}
