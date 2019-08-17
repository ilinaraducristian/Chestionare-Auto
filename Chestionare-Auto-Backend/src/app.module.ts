import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Config } from './classes/config';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { MongoService } from './services/mongo-models/mongo.service';

import { ChestionarSchema } from './schemas/chestionar.schema';
import { SessionSchema } from './schemas/session.schema';

import { categories } from './categories';

@Module({
  imports: [
    MongooseModule.forRoot(Config.mongoURI, { useNewUrlParser: true }),
    AppModule.generate_models(),
  ],
  controllers: [AppController],
  providers: [AppService, MongoService],
})
export class AppModule {
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
