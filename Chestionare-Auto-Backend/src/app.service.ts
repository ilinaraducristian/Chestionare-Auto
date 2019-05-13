import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chestionar } from './interfaces/chestionar.interface';
import { Session } from './interfaces/session.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AppService {
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
  ) {}

  getChestionare(category: string): Promise<Chestionar[]> {
    let categoryModel: Model<Chestionar>;
    switch (category) {
      case 'categoria_a':
        categoryModel = this.chestionarModelCategoriaA;
        break;
      case 'categoria_b':
        categoryModel = this.chestionarModelCategoriaB;
        break;
      case 'categoria_c':
        categoryModel = this.chestionarModelCategoriaC;
        break;
      case 'categoria_d':
        categoryModel = this.chestionarModelCategoriaD;
        break;
    }
    return categoryModel
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec();
  }

  getSession(id: string): Promise<Session> {
    return this.sessionModel.findById(id).exec();
  }

  newSession(category: string): Promise<Object> {
    return this.getChestionare(category).then(chestionare =>
      new this.sessionModel({
        created_at: new Date(),
        chestionare,
        correct_answers: 0,
        wrong_answers: 0,
      }).save(),
    );
  }
}
