import { Injectable } from '@nestjs/common';
import { Chestionar } from './interfaces/chestionar.interface';
import { Session } from './interfaces/session.interface';
import { MongoService } from './services/mongo-models/mongo.service';

@Injectable()
export class AppService {
  constructor(private readonly mongo_service: MongoService) {}
  /**
   * Queries the database for chestionare.
   * @param category One of the 4 categories as a string.
   * @return Returns a promise with 26 chestionare without _id.
   */
  get_chestionare_from_db(category: string): Promise<Chestionar[]> {
    return this.mongo_service[category]
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec();
  }
  /**
   * Generates a new session based on the category.
   * @param category One of the four categories as a string.
   * @return Returns a new session.
   */
  new_session(category: string): Promise<Session> {
    return this.get_chestionare_from_db(category)
      .then(chestionare => {
        if (chestionare.length === 0) {
          return Promise.reject('Chestionare not found!');
        } else {
          return Promise.resolve(chestionare);
        }
      })
      .then(chestionare => {
        let now = new Date();
        return new this.mongo_service.models.session({
          created_at: now,
          now,
          chestionare,
          correct_answers: 0,
          wrong_answers: 0,
        }).save();
      });
  }

  get_session(id: string): Promise<Session> {
    return this.mongo_service.models.session.findById(id).exec();
  }
}
