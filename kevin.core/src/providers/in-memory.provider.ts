import { type IProvider } from "../interfaces";
export class InMemoryProvider implements IProvider {
    getDelimiter(): string {
         return ".";
    }

    private readonly store = new Map<string, string>();

    async getValue(key: string): Promise<string> {
        return await Promise.resolve(this.store.get(key));
    }

    async setValue(key: string, value: string): Promise<void> {
        this.store.set(key, value);
        await Promise.resolve();
    }

    async getValueRange(keyPrefix: string): Promise<string[]> {
        const keys = await this.getKeys(keyPrefix);

        return keys.filter(key => key.startsWith(keyPrefix)).map(key => this.store.get(key));

    }

    async getKeys(keyPrefix: string): Promise<string[]> {
        return await Promise.resolve(Array.from(this.store.keys()).filter(key => key.startsWith(keyPrefix)));
    }

    async hasKey(key: string): Promise<boolean> {
        return await Promise.resolve(this.store.has(key));
    }

}