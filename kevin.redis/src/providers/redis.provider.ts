import { IProvider } from "@kevin-infra/core/interfaces"
import Redis from "ioredis"


export class RedisProvider implements IProvider {

    constructor(private client: Redis) { }

    getValue(key: string): Promise<string> {
        return this.client.get(key);
    }
    setValue(key: string, value: string): Promise<void> {
        return this.client.set(key, value);
    }
    async getValueRange(keyPrefix: string): Promise<string[]> {
        const keys = await this.getKeys(keyPrefix);

        const promises = keys.map(key => this.client.get(key));

        return Promise.all(promises);
    }
    getKeys(keyPrefix: string): Promise<string[]> {
        return this.client.keys(`${keyPrefix}*`);
    }
    hasKey(key: string): Promise<boolean> {
        return this.client.exists(key);
    }

}