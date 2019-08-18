import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';

import * as dotenv from 'dotenv';

import { AppService } from './app.service';
import { MongoService } from './services/mongo-models/mongo.service';

import { ChestionarSchema } from './schemas/chestionar.schema';
import { SessionSchema } from './schemas/session.schema';

import { categories } from './categories';

@Module({
  imports: [AppModule.connect_mongo(), AppModule.generate_models()],
  controllers: [AppController],
  providers: [AppService, MongoService],
})
export class AppModule {
  static connect_mongo() {
    let config;
    if (process.env.NODE_ENV == 'production') {
      config = dotenv.config({
        path: './environments/environment.prod.env',
      });
    } else {
      config = dotenv.config({ path: './src/environments/environment.env' });
    }

    return MongooseModule.forRoot(config.parsed.mongoURI, {
      useNewUrlParser: true,
    });
  }

  static generate_models() {
    let models: { name: string; schema; collection?: string }[];
    models = [{ name: 'session', schema: SessionSchema }];
    categories.forEach(category => {
      models.push({
        name: category,
        schema: ChestionarSchema,
        collection: category,
      });
    });

    return MongooseModule.forFeature(models);
  }
}
