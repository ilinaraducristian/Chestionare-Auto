import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalErrorException extends HttpException {
  constructor() {
    super('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
