import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChestionarSchema } from './schemas/chestionar.schema';
import { SessionSchema } from './schemas/session.schema';
import { MongoService } from './services/mongo-models/mongo.service';
import { categories } from './categories';
import { Config } from './classes/config';

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
