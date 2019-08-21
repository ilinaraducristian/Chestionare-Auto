import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalErrorException extends HttpException {
  constructor() {
    super({ error: 'Internal error' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
