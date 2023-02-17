import { IEnvironmentMetaData, IEnvironmentInformation } from "./environment-data";
import { IKevinValue } from "./kevin-value";

export interface IKevinManager {
    getEnvironments(): Promise<Array<IEnvironmentMetaData>>;
    setCurrentEnvironment(environmentId: string): Promise<IEnvironmentInformation>;
    getEnvironmentData(): Promise<Array<IKevinValue>>;
    getValue<T>(key: string): Promise<IKevinValue>;
    setValue(key: string, value: string): Promise<void>;
    createRootEnvironment(): Promise<IEnvironmentInformation>;
    createEnvironment(environmentName: string, parentEnvironmentId?: string): Promise<IEnvironmentMetaData>;
    addKey(key: string, value: string, defaultValue?): Promise<void>;
    


}
