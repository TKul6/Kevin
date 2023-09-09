import { Service } from 'typedi';
import { type ProviderFactory } from './factory';
import { type IProvider } from '@kevin-infra/core/interfaces';

const KEVIN_REDIS_IMPORT = '@kevin-infra/redis';
const IOREDIS_IMPORT = 'ioredis';

@Service('provider.redis.factory')
export class RedisProviderFactory implements ProviderFactory {
  async create(): Promise<IProvider> {
    const redisUrl = process.env.REDIS_PROVIDER_URL;

    if (!redisUrl) {
      console.error('Could not locate redis url. Please set REDIS_PROVIDER_URL environment variable.');
      throw new Error('Redis URL not found');
    }

    const { RedisProvider } = await import(KEVIN_REDIS_IMPORT);
    const { default: Redis } = await import('ioredis');
    return new RedisProvider(new Redis(IOREDIS_IMPORT));
  }
}
