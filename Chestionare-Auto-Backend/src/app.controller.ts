import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';

import { AppService } from './app.service';

import { ChestionarNotFoundException } from './exceptions/chestionar-not-found-exception';
import { InvalidCategoryException } from './exceptions/invalid-category-exception';
import { InternalErrorException } from './exceptions/internal-error-exception';
import { InvalidTokenException } from './exceptions/invalid-token-exception';
import { InvalidSessionIDException } from './exceptions/invalid-session-id-exception';

import { AnswersBody } from './interfaces/answers-body.interface';
import { Session } from './interfaces/session.interface';

import * as jwt from 'jsonwebtoken';
import { categories } from './categories';

@Controller('session')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post(':category')
  async newSession(@Param('category') category: string) {
    let token: string, session: Session;
    if (!categories.includes(category)) throw new InvalidCategoryException();
    try {
      session = await this.appService.newSession(category);
    } catch (error) {
      console.log(error);
      throw new InternalErrorException();
    }
    token = jwt.sign(session._id.toString(), process.env.secret);
    session = session.toObject();
    delete session._id;
    session.chestionare.map(chestionar => {
      delete chestionar.correct_answers;
      return chestionar;
    });
    return { token, now: session.created_at, session };
  }

  @Get(':token')
  async getSession(@Param('token') token: string) {
    let session, status;
    let sessionOrStatus = await this.getAndVerifySession(token);
    if (typeof sessionOrStatus == 'string') {
      status = sessionOrStatus;
      return { status };
    } else {
      session = sessionOrStatus;
    }
    session = session.toObject();
    session.chestionare.map(chestionar => {
      delete chestionar.correct_answers;
      return chestionar;
    });
    delete session._id;
    let now = new Date();
    return { now, session };
  }

  @Put(':token')
  async sendAnswers(
    @Param('token') token: string,
    @Body() answersBody: AnswersBody,
  ) {
    let session, status, chestionar;
    let sessionOrStatus = await this.getAndVerifySession(token);
    if (typeof sessionOrStatus == 'string') {
      status = sessionOrStatus;
      return { status };
    } else {
      session = sessionOrStatus;
    }
    chestionar = session.chestionare[answersBody.id];
    if (!chestionar) throw new ChestionarNotFoundException();
    if (chestionar.correct_answers === answersBody.answers) {
      session.correct_answers++;
      status = 'correct';
    } else {
      session.wrong_answers++;
      status = 'wrong';
    }
    if (session.wrong_answers >= 5) {
      await session.remove();
      return { status: 'failed' };
    }
    session.chestionare.splice(answersBody.id, 1);
    if (session.chestionare.length == 0) {
      await session.remove();
      return { status: 'passed' };
    } else {
      await session.save();
      return { status };
    }
  }

  private async getAndVerifySession(token: string): Promise<Session | string> {
    let id;
    let session: Session;
    try {
      id = jwt.verify(token, process.env.secret);
    } catch (error) {
      throw new InvalidTokenException();
    }
    try {
      session = await this.appService.getSession(id);
    } catch (error) {
      throw new InvalidSessionIDException();
    }
    if (this.isSessionExpired(session)) {
      await session.remove();
      if (session.correct_answers >= 22) {
        return 'passed';
      } else {
        return 'failed';
      }
    }
    return session;
  }

  private isSessionExpired(session: Session): boolean {
    let now = new Date();
    let sessionExpirationDate = session.created_at.getTime() + 1800000;
    return now.getTime() >= sessionExpirationDate;
  }
}
