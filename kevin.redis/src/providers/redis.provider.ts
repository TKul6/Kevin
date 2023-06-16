import { type IProvider } from "@kevin-infra/core/interfaces"
import type Redis from "ioredis"


export class RedisProvider implements IProvider {

    constructor(private readonly client: Redis) { }

    async getValue(key: string): Promise<string> {
        return this.client.get(key);
    }

    async setValue(key: string, value: string): Promise<void> {
        return this.client.set(key, value);
    }

    async getValueRange(keyPrefix: string): Promise<string[]> {
        const keys = await this.getKeys(keyPrefix);

        const promises = keys.map(key => this.client.get(key));

        return await Promise.all(promises);
    }

    async getKeys(keyPrefix: string): Promise<string[]> {
        return this.client.keys(`${keyPrefix}*`);
    }

    async hasKey(key: string): Promise<boolean> {
        return this.client.exists(key);
    }

    async deleteKey(key: string): Promise<void> {
        return this.client.del(key);
    }

    getDelimiter(): string {
        return ":";
    }

}