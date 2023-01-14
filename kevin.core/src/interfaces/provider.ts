export interface IProvider {
    getValue(key: string): Promise<string>;
    setValue(key: string, value: string): Promise<void>;
    getValueRange(keyPrefix: string): Promise<string[]>;
    getKeys(keyPrefix: string): Promise<string[]>;

}