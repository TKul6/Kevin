import 'reflect-metadata';
// import { RedisProvider } from '@kevin-infra/redis';
import { KevinService } from '@kevin-infra/core/services';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
// import Redis from 'ioredis';
import { EnvironmentKeysController } from './controllers/kv.controller';
import { EnvironmentsController } from './controllers/environments.controller';
import { InMemoryProvider } from '@kevin-infra/core/src/providers/in-memory.provider';

// Container.set('kevin.service', new KevinService(new RedisProvider(new Redis("redis://localhost:6379"))));
Container.set('kevin.service', new KevinService(new InMemoryProvider()));

useContainer(Container);

const app = createExpressServer({
  controllers: [EnvironmentKeysController, EnvironmentsController]
});


app.listen(3000);
console.log("App is running on port 3000");