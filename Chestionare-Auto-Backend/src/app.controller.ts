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
import * as jwt from 'jsonwebtoken';
import { AppService } from './app.service';
import { Session } from './interfaces/session.interface';
import { Response } from 'express';
import { Config } from './classes/config';
import { AnswersBody } from './interfaces/answers_body.interface';
import { categories } from './categories';

@Controller('session')
export class AppController {
  constructor(private readonly app_service: AppService) {}

  @Post(':category')
  new_session(@Param('category') category: string, @Res() response: Response) {
    if (!categories.includes(category))
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: 'Invalid category!' });
    this.app_service
      .new_session(category)
      .then(session => {
        session = session.toObject();
        session.chestionare.map(chestionar => {
          delete chestionar.correct_answers;
          return chestionar;
        });
        let token = jwt.sign(session._id.toString(), Config.secret);
        delete session._id;
        response.send({ token, session });
      })
      .catch(error => {
        console.log(error);
        response
          .status(HttpStatus.BAD_REQUEST)
          .send({ error: 'Invalid category!' });
      });
  }

  @Get(':token')
  get_session(@Param('token') token: string, @Res() response: Response) {
    this.verify_token(token)
      .then(id => this.app_service.get_session(id))
      .then(this.is_session_expired)
      .then(({ session, status }) => {
        if (status == 'passed' || status == 'failed') {
          session.remove().then(() => {
            response.send({ status });
          });
        } else {
          session = session.toObject();
          session.chestionare.map(chestionar => {
            delete chestionar.correct_answers;
            return chestionar;
          });
          delete session._id;
          response.send({ session });
        }
      })
      .catch(error => {
        console.log(error);
        response
          .status(HttpStatus.BAD_REQUEST)
          .send({ error: 'Invalid session id!' });
      });
  }

  @Put(':token')
  sendAnswers(
    @Param('token') token: string,
    @Body() answersBody: AnswersBody,
    @Res() response: Response,
  ) {
    this.verify_token(token)
      .then(id => this.app_service.get_session(id))
      .then(this.is_session_expired)
      .then(({ session, status }) => {
        if (status == 'passed' || status == 'failed') {
          session.remove().then(() => {
            response.send({ status });
          });
        } else {
          let chestionar = session.chestionare[answersBody.id];
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
              .then(_ => response.send({ status: 'failed' }));
          }
          session.chestionare.splice(answersBody.id, 1);
          if (session.chestionare.length == 0) {
            session.remove().then(_ => response.send({ status: 'passed' }));
          } else {
            session.save().then(_ => response.send({ status }));
          }
        }
      })
      .catch(error => {
        console.log(error);
        response
          .status(HttpStatus.BAD_REQUEST)
          .send({ error: 'Invalid session id or body!' });
      });
  }
  private is_session_expired(session: Session) {
    let now = new Date();
    let session_expiration_date = session.created_at.getTime() + 1800000;
    if (now.getTime() >= session_expiration_date) {
      if (session.correct_answers >= 22) {
        return Promise.resolve({ session, status: 'passed' });
      } else {
        return Promise.resolve({ session, status: 'failed' });
      }
    }
    return Promise.resolve({ session, status: 'no' });
  }

  verify_token(token: string) {
    let id;
    try {
      id = jwt.verify(token, Config.secret);
    } catch (error) {
      return Promise.reject('Invalid token!');
    }
    return Promise.resolve(id);
  }
}
