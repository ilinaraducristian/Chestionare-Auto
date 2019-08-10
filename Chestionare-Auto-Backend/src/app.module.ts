import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChestionarSchema } from './schemas/chestionar.schema';
import config from 'config';
import { SessionSchema } from './schemas/session.schema';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoURI, { useNewUrlParser: true }),
    AppModule.generateModels(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static generateModels() {
    let models: {
      name: string;
      schema: any;
      collection?: string;
    }[] = [];
    let categories: string[] = [
      'category_a',
      'category_b',
      'category_c',
      'category_d',
    ];
    for (let i = 0; i < categories.length; i++) {
      models.push({
        name: categories[i],
        schema: ChestionarSchema,
        collection: categories[i],
      });
    }
    models.push({
      name: 'session',
      schema: SessionSchema,
      collection: 'sessions',
    });
    return MongooseModule.forFeature(models);
  }
}
