import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidSessionIDException extends HttpException {
  constructor() {
    super({ error: 'Invalid session id' }, HttpStatus.BAD_REQUEST);
  }
}
