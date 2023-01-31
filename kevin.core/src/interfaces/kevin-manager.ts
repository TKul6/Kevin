import { IEnvironmentMetaData, IEnvironmentInformation } from "./environment-data";
import { IKevinValue } from "./kevin-value";

export interface IKevinManager {
    getEnvironments(): Promise<Array<IEnvironmentMetaData>>;
    setCurrentEnvironment(environmentName: string): Promise<IEnvironmentInformation>;
    getEnvironmentData(): Promise<Array<IKevinValue>>;
    getValue<T>(key: string): Promise<IKevinValue>;
    setValue(key: string, value: string): Promise<void>;
    createRootEnvironment(): Promise<IEnvironmentInformation>;


}
