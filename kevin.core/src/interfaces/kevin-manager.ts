import { type IEnvironmentMetaData, type IEnvironmentInformation } from "./environment-data";
import { type IKevinValue } from "./kevin-value";

export interface IKevinManager {
    getEnvironments(): Promise<IEnvironmentMetaData[]>;
    setCurrentEnvironment(environmentId: string): Promise<IEnvironmentInformation>;
    getEnvironmentData(): Promise<IKevinValue[]>;
    getValue(key: string): Promise<IKevinValue>;
    setValue(key: string, value: string): Promise<void>;
    createRootEnvironment(): Promise<IEnvironmentInformation>;
    createEnvironment(environmentName: string, parentEnvironmentId?: string): Promise<IEnvironmentMetaData>;
    addKey(key: string, value: string, defaultValue?): Promise<void>;
    deleteKey(key: string): Promise<void>;

}
