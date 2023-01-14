import {IEnvironmentMetaData, IEnvironmentInformation, IKevinManager, IKevinValue, IProvider} from '../interfaces'
import {EnvironmentNotFoundError, InvalidEnvironmentInfoError} from '../errors'
const KEVIN_INTERNAL_ENVIRONMENT_PREFIX = "kevin.internal.environments";
const KEY_DELIMITER = ".keys.";
const DEFAULT_ENVIRONMENT_NAME = "default";
export class KevinService implements IKevinManager
{

    private envInfo: IEnvironmentInformation;
    constructor(private provider: IProvider) {

        if(!provider) {
            throw new Error("Provider is required");
        }

    }
    async createDefaultEnvironment(): Promise<IEnvironmentInformation> {
        const data: IEnvironmentMetaData = {
            name: DEFAULT_ENVIRONMENT_NAME,
            id: DEFAULT_ENVIRONMENT_NAME,
            parentEnvironmentId: null,
        }

       await this.provider.setValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + data.name, JSON.stringify(data));

       return {name: DEFAULT_ENVIRONMENT_NAME, id: DEFAULT_ENVIRONMENT_NAME, parentEnvironment: null}

    }

    getEnvironments(): Promise<IEnvironmentMetaData[]> {

        //TODO - implement after provider support keyKeyRange.
        throw new Error('Method not implemented.');
    }
    async setCurrentEnvironment(environmentName: string): Promise<void> {

        const parseData = await this.getEnvironmentMetaData(environmentName);

        // TODO - here the environment info has only the parent id need to iterate over the parent and build the full chain.
        this.envInfo  = {id: parseData.id, name: parseData.name, parentEnvironment: null}

        let parentEnvironmentId = parseData.parentEnvironmentId;
let currentEnvironment = this.envInfo;
        while(parentEnvironmentId) {
            const parentEnvironment =   await this.getEnvironmentMetaData(parentEnvironmentId);
currentEnvironment.parentEnvironment = {id: parentEnvironment.id, name: parentEnvironment.name, parentEnvironment: null};
            parentEnvironmentId = parentEnvironment.parentEnvironmentId;
            currentEnvironment = currentEnvironment.parentEnvironment;
 
        }


    }
        private async getEnvironmentMetaData(environmentName: string): Promise<IEnvironmentMetaData> {
            const data = await this.provider.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + environmentName);

            if (!data) {
                throw new EnvironmentNotFoundError(environmentName);
            }

            const parseData = JSON.parse(data) as IEnvironmentMetaData;

            if (!parseData) {
                throw new InvalidEnvironmentInfoError(environmentName);
            }
            return parseData;
        }
    
    
    async getValue(key: string): Promise<IKevinValue> {
        let currentEnvironment = this.envInfo;
        let value = await this.provider.getValue(this.getFullKey(key, currentEnvironment));

        while(!value && this.envInfo.parentEnvironment) {
            currentEnvironment = currentEnvironment.parentEnvironment;
            value = await this.provider.getValue(this.getFullKey(key, currentEnvironment));
        }

        if(!value) {
            return null;
        }
        return {value, environmentInfo: currentEnvironment}





    }
    setValue(key: string, value: string): Promise<void> {
        return this.provider.setValue(this.getFullKey(key), value);
    }

    getEnvironmentData(): Promise<IKevinValue[]> {
        // Todo - implement after provider support keyKeyRange.
        throw new Error('Method not implemented.');
    }

    private getFullKey(key: string, environment: IEnvironmentInformation = this.envInfo): string {
        return environment.id + KEY_DELIMITER + key;
    }

}