import 'reflect-metadata';
import { KevinService } from '@kevin-infra/core/services';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { EnvironmentKeysController } from './controllers/kv.controller';
import { EnvironmentsController } from './controllers/environments.controller';
import { KevinErrorHandlerMiddleware } from './middlewares/kevin-errors-handler.middleware';
import * as express from 'express';
import { resolve } from 'path';
import { ProviderGenerator } from './provider-factories/provider-generator';

(async () => {
  const providerGenerator = new ProviderGenerator();

  const provider = await providerGenerator.generate(process.env.PROVIDER_TYPE);

  Container.set('kevin.service', new KevinService(provider));
  useContainer(Container);

  const app = createExpressServer({
    controllers: [EnvironmentKeysController, EnvironmentsController],
    middlewares: [KevinErrorHandlerMiddleware],
    defaultErrorHandler: false,
  });

  app.use(express.static(resolve(__dirname, 'public')));

  app.listen(3000);
  console.log('App is running on port 3000');
})().then(() => {}).catch((err) => {console.log(err)});
