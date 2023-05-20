import 'reflect-metadata';
import { RedisProvider } from '@kevin-infra/redis';
import { KevinService } from '@kevin-infra/core/services';
import {
  createExpressServer,
  useContainer,
} from 'routing-controllers';
import { Container } from 'typedi';
import Redis from 'ioredis';
import { EnvironmentKeysController } from './controllers/kv.controller';
import { EnvironmentsController } from './controllers/environments.controller';
// import { InMemoryProvider } from '@kevin-infra/core/src/providers/in-memory.provider';
import { KevinErrorHandlerMiddleware } from './middlewares/kevin-errors-handler.middleware';
import * as express from  'express';
import { resolve } from 'path';
// import { AwsParametersStoreProvider } from '@kevin-infra/aws';

// Container.set('kevin.service', new KevinService(new AwsParametersStoreProvider({ region: 'eu-central-1' })));
Container.set(
  'kevin.service',
  new KevinService(
    new RedisProvider(
      new Redis(
        'redis://localhost:6379'
      )
    )
  )
);
useContainer(Container);

const app = createExpressServer({
  controllers: [
    EnvironmentKeysController,
    EnvironmentsController,
  ],
  middlewares: [
    KevinErrorHandlerMiddleware,
  ],
  defaultErrorHandler: false,
});


app.use(express.static(resolve(__dirname, "public")));

app.listen(3000);
console.log(
  'App is running on port 3000'
);
