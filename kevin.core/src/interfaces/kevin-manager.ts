import { IEnvironmentData, IEnvironmentInformation } from "./environment-data";
import { IKevinValue } from "./kevin-value";

export  interface IKevinManager {
    getEnvironments(): Promise<Array<IEnvironmentData>>;
    setCurrentEnvironment(environmentName: string): Promise<void>;
    getEnvironmentData(): Promise<Array<IKevinValue>>;
    getValue<T>(key: string): Promise<IKevinValue>;
    setValue(key: string, value: string): Promise<void>;
    createDefaultEnvironment(): Promise<IEnvironmentInformation>;
    
    
}
