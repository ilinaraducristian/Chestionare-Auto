import {
  Controller,
  Get,
  Res,
  Post,
  Body,
  Param,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Session } from './interfaces/session.interface';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import config from 'config';
import { AnswersBody } from './interfaces/answers_body.interface';

@Controller('session')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':token')
  getSession(@Param('token') token: string, @Res() response: Response) {
    let id;

    try {
      id = jwt.verify(token, config.secret);
    } catch (error) {
      console.log(error);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Invalid token!' });
    }
    this.appService
      .getSession(id)
      .then(session => this.isSessionExpired(session, response))
      .then(session => {
        if (!session) return;
        response.json({ session });
      })
      .catch(error => {
        console.log(error);
        response
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Invalid session id!' });
      });
  }

  @Post(':category')
  newSession(@Param('category') category: string, @Res() response: Response) {
    let categories = ['category_a', 'category_b', 'category_c', 'category_d'];
    if (!categories.includes(category))
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Invalid category!' });
    this.appService
      .newSession(category)
      .then(session => {
        session = session.toObject() as Session;
        session.chestionare.map(chestionar => {
          delete chestionar.correct_answers;
          return chestionar;
        });
        let token = jwt.sign(session._id.toString(), config.secret);
        delete session._id;
        response.json({ token, session });
      })
      .catch(error => {
        console.log(error);
        response
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Invalid category!' });
      });
  }

  @Put(':token')
  sendAnswers(
    @Param('token') token: string,
    @Body() answersBody: AnswersBody,
    @Res() response: Response,
  ) {
    let id;

    try {
      id = jwt.verify(token, config.secret);
    } catch (error) {
      console.log(error);
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Invalid token!' });
    }

    this.appService
      .getSession(id)
      .then(session => this.isSessionExpired(session, response))
      .then(session => {
        if (!session) return;

        let chestionar = session.chestionare[answersBody.id];
        let status: string;
        if (!chestionar)
          return Promise.reject(new Error('Chestionar not found!'));
        if (chestionar.correct_answers === answersBody.answers) {
          session.correct_answers++;
          status = 'correct';
        } else {
          session.wrong_answers++;
          status = 'wrong';
        }
        if (session.wrong_answers >= 5) {
          return session
            .remove()
            .then(_ => response.json({ status: 'failed' }));
        }
        session.chestionare.splice(answersBody.id, 1);
        if (session.chestionare.length == 0) {
          session.remove().then(_ => response.json({ status: 'passed' }));
        } else {
          session.save().then(_ => response.json({ status }));
        }
      })
      .catch(error => {
        console.log(error);
        response
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Invalid session id or body!' });
      });
  }
  private isSessionExpired(
    session: Session,
    response,
  ): Promise<Session | void> {
    let now = new Date();
    let session_expiration_date = session.created_at.getTime() + 1800000;
    // If session expired
    if (now.getTime() >= session_expiration_date) {
      if (session.correct_answers >= 22) {
        return session.remove().then(_ => {
          response.json({ status: 'passed' });
        });
      } else {
        return session.remove().then(_ => {
          response.json({ status: 'failed' });
        });
      }
    }
    session.chestionare.map(chestionar => {
      delete chestionar.correct_answers;
      return chestionar;
    });
    session.now = now;
    return Promise.resolve(session);
  }
}
