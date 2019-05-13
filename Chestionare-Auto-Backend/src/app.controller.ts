import { Controller, Get, Res, Req, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Session } from './interfaces/session.interface';
import { Response } from 'express';

@Controller('session')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':token')
  getChestionar(@Param('token') token: string): string {
    this.appService
      .getChestionare('categoria_a')
      .then(session => console.log(session))
      .catch(error => console.log(error));
    return 'it works!';
  }

  @Post(':category')
  newSession(@Param('category') category: string, @Res() response: Response) {
    this.appService
      .newSession(category)
      .then(session => {
        let newSession = (session as Session).toObject() as Session;
        delete newSession._id;
        delete newSession.chestionare; // debug only
        response.json(session);
      })
      .catch(error => console.log(error));
  }
}
