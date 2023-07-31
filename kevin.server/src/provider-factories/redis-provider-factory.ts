import { RedisProvider } from '@kevin-infra/redis';
import { Service } from 'typedi';
import { ProviderFactory } from './factory';
import { IProvider } from '@kevin-infra/core/interfaces';
import Redis from 'ioredis';

@Service('provider.redis.factory')
export class RedisProviderFactory implements ProviderFactory {
  create(): IProvider {
    const redisUrl = process.env.REDIS_PROVIDER_URL;

    if (!redisUrl) {
      console.error('Could not locate redis url. Please set REDIS_PROVIDER_URL environment variable.');
      throw new Error('Redis URL not found');
    }

    return new RedisProvider(new Redis(redisUrl));
  }
}
