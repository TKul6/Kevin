import { IEnvironmentData } from "./environment-data";
import { IKevinValue } from "./kevin-value";

export  interface IKevinManager {
    getEnvironments(): Promise<Array<IEnvironmentData>>;
    setCurrentEnvironment(environmentName: string): void;
    getEnvironmentData(): Promise<Array<IKevinValue>>;
    getValue(key: string): Promise<IKevinValue>;
    setValue(key: string, value: any): Promise<void>;
    
}