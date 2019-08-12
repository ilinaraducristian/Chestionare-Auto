import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chestionar } from './interfaces/chestionar.interface';
import { Session } from './interfaces/session.interface';

@Injectable()
export class AppService {
  private chestionarModels: Object;
  constructor(
    @InjectModel('category_a')
    private readonly chestionarModelcategoryA: Model<Chestionar>,
    @InjectModel('category_b')
    private readonly chestionarModelcategoryB: Model<Chestionar>,
    @InjectModel('category_c')
    private readonly chestionarModelcategoryC: Model<Chestionar>,
    @InjectModel('category_d')
    private readonly chestionarModelcategoryD: Model<Chestionar>,
    @InjectModel('session')
    private readonly sessionModel: Model<Session>,
  ) {
    this.chestionarModels = {
      category_a: this.chestionarModelcategoryA,
      category_b: this.chestionarModelcategoryB,
      category_c: this.chestionarModelcategoryC,
      category_d: this.chestionarModelcategoryD,
    };
  }
  /**
   * Queries the database for chestionare.
   * @param category One of the 4 categories as a string.
   * @return Returns a promise with 26 chestionare without _id.
   */
  getChestionareFromDB(category: string): Promise<Chestionar[]> {
    return this.chestionarModels[category]
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec();
  }
  /**
   * Generates a new session based on the category.
   * @param category One of the four categories as a string.
   * @return Returns a new session.
   */
  newSession(category: string): Promise<Session> {
    return this.getChestionareFromDB(category)
      .then(chestionare => {
        if (chestionare.length === 0) {
          return Promise.reject('Chestioanre not found!');
        }
        return Promise.resolve(chestionare);
      })
      .then(chestionare =>
        new this.sessionModel({
          created_at: new Date(),
          chestionare,
          correct_answers: 0,
          wrong_answers: 0,
        }).save(),
      );
  }

  getSession(id: string): Promise<Session> {
    return this.sessionModel.findById(id).exec();
  }
}
