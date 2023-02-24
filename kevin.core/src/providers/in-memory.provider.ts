import { IProvider } from "../interfaces";
export class InMemoryProvider implements IProvider {
    getDelimiter(): string {
        return ".";
    }

    private store = new Map<string, string>();

    getValue(key: string): Promise<string> {
        return Promise.resolve(this.store.get(key));
    }
    setValue(key: string, value: string): Promise<void> {
        this.store.set(key, value);
        return Promise.resolve();
    }
    async getValueRange(keyPrefix: string): Promise<string[]> {
        const keys = await this.getKeys(keyPrefix);

        return keys.filter(key => key.startsWith(keyPrefix)).map(key => this.store.get(key));

    }
    getKeys(keyPrefix: string): Promise<string[]> {
        return Promise.resolve(Array.from(this.store.keys()).filter(key => key.startsWith(keyPrefix)));
    }
    hasKey(key: string): Promise<boolean> {
        return Promise.resolve(this.store.has(key));
    }

}