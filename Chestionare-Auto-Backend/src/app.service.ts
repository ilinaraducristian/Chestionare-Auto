import { Injectable } from '@nestjs/common';

import { Chestionar } from './interfaces/chestionar.interface';
import { Session } from './interfaces/session.interface';

import { MongoService } from './services/mongo-models/mongo.service';
import { ChestionarSchema } from './schemas/chestionar.schema';

@Injectable()
export class AppService {
  constructor(private readonly mongoService: MongoService) {}
  /**
   * Queries the database for 26 chestionare.
   * @param category One of the categories.
   * @return Returns a promise with chestionare without _id.
   */
  getChestionareFromDB(category: string): Promise<Chestionar[]> {
    return this.mongoService[category]
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec();
  }
  /**
   * Generates a new session based on the category.
   * @param category One of the categories.
   * @return Returns a new session.
   */
  async newSession(category: string): Promise<Session> {
    let chestionare;
    try {
      chestionare = await this.getChestionareFromDB(category);
    } catch (error) {
      console.log(error);
      return Promise.reject('Chestionare not found!');
    }
    return new this.mongoService.models.session({
      created_at: new Date(),
      chestionare,
      correct_answers: 0,
      wrong_answers: 0,
    }).save();
  }

  /**
   * Finds an existing session with the given id.
   * @param id Session id in the databse.
   * @return Returns an existing session.
   */
  getSession(id: string): Promise<Session> {
    return this.mongoService.models.session.findById(id).exec();
  }
}
