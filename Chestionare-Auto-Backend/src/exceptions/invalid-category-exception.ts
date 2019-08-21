import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCategoryException extends HttpException {
  constructor() {
    super({ error: 'Invalid category' }, HttpStatus.BAD_REQUEST);
  }
}
