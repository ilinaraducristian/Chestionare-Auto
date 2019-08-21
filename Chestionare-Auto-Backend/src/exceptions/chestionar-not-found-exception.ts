import { HttpException, HttpStatus } from '@nestjs/common';

export class ChestionarNotFoundException extends HttpException {
  constructor() {
    super({ error: 'Chestionar not found' }, HttpStatus.BAD_REQUEST);
  }
}
