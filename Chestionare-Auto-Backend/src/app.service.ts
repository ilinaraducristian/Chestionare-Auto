import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chestionar } from './interfaces/chestionar.interface';
import { Session } from './interfaces/session.interface';

@Injectable()
export class AppService {
  private chestionarModels: Object;
  constructor(
    @InjectModel('categoria_a')
    private readonly chestionarModelCategoriaA: Model<Chestionar>,
    @InjectModel('categoria_b')
    private readonly chestionarModelCategoriaB: Model<Chestionar>,
    @InjectModel('categoria_c')
    private readonly chestionarModelCategoriaC: Model<Chestionar>,
    @InjectModel('categoria_d')
    private readonly chestionarModelCategoriaD: Model<Chestionar>,
    @InjectModel('session')
    private readonly sessionModel: Model<Session>,
  ) {
    this.chestionarModels = {
      categoria_a: this.chestionarModelCategoriaA,
      categoria_b: this.chestionarModelCategoriaB,
      categoria_c: this.chestionarModelCategoriaC,
      categoria_d: this.chestionarModelCategoriaD,
    };
  }
  /**
   * Queries the database for chestionare.
   * @param category One of the 4 categories as a string.
   * @return Returns 26 chestionare without the "_id" filed.
   */
  getChestionare(category: string): Promise<Chestionar[]> {
    return this.chestionarModels[category]
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec();
  }
  /**
   * Generates a new session based on the category.
   * @param category One of the four categories as a string.
   * @return
   */
  newSession(category: string): Promise<Object | Session> {
    return this.getChestionare(category).then(chestionare =>
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
