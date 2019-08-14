import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chestionar } from 'src/interfaces/chestionar.interface';
import { Session } from 'src/interfaces/session.interface';

@Injectable()
export class MongoService {
  public readonly models: {
    category_a: Model<Chestionar>;
    category_b: Model<Chestionar>;
    category_c: Model<Chestionar>;
    category_d: Model<Chestionar>;
    session: Model<Session>;
  };
  constructor(
    @InjectModel('category_a')
    private readonly category_a: Model<Chestionar>,
    @InjectModel('category_b')
    private readonly category_b: Model<Chestionar>,
    @InjectModel('category_c')
    private readonly category_c: Model<Chestionar>,
    @InjectModel('category_d')
    private readonly category_d: Model<Chestionar>,
    @InjectModel('session')
    private readonly session: Model<Session>,
  ) {
    this.models = {
      category_a: this.category_a,
      category_b: this.category_b,
      category_c: this.category_c,
      category_d: this.category_d,
      session: this.session,
    };
  }
}
