import 'reflect-metadata';
import { RedisProvider } from '@kevin-infra/redis';
import { KevinService } from '@kevin-infra/core/services';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import Redis from 'ioredis';
import {join} from 'path';
import { EnvironmentKeysController } from './controllers/kv.controller';
import { EnvironmentsController } from './controllers/environments.controller';

Container.set('kevin.service', new KevinService(new RedisProvider(new Redis("redis://localhost:6379"))));

useContainer(Container);

// creates express app, registers all controller routes and returns you express app instance
const app = createExpressServer({
  controllers: [EnvironmentKeysController, EnvironmentsController]
});

// run express application on port 3000
app.listen(3000);
console.log("App is running on port 3000");