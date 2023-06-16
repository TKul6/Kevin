export interface IProvider {
    getValue(key: string): Promise<string>;
    setValue(key: string, value: string): Promise<void>;
    getValueRange(keyPrefix: string): Promise<string[]>;
    getKeys(keyPrefix: string): Promise<string[]>;
    hasKey(key: string): Promise<boolean>;
    getDelimiter(): string;
    deleteKey(key: string): Promise<any>;

}