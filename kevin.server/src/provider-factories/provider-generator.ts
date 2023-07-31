import { RedisProviderFactory } from './redis-provider-factory';
import { ProviderFactory } from './factory';
import { IProvider } from '@kevin-infra/core/interfaces';
import Container from 'typedi';

const SUPPORTED_PROVIDERS_TYPES = ['provider.type.redis'];

export class ProviderGenerator {
  constructor() {
    Container.set('provider.type.redis', new RedisProviderFactory());
  }

  generate(providerType: string): IProvider {
    if (!SUPPORTED_PROVIDERS_TYPES.includes(providerType)) {
      throw new Error(`Unsupported provider type: ${providerType}`);
    }

    const factory: ProviderFactory = Container.get(providerType);

    return factory.create();
  }
}
