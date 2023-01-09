import {IEnvironmentData, IEnvironmentInformation, IKevinManager, IKevinValue, IProvider} from '../interfaces'
import {EnvironmentNotFoundError, InvalidEnvironmentInfoError} from '../errors'
const KEVIN_INTERNAL_ENVIRONMENT_PREFIX = "kevin.internal.environments";
const KEY_DELIMITER = ".keys.";

export class KevinService implements IKevinManager
{

    private envInfo: IEnvironmentInformation;
    constructor(private provider: IProvider) {

        if(!provider) {
            throw new Error("Provider is required");
        }

    }
    async createDefaultEnvironment(): Promise<IEnvironmentInformation> {
        const data: IEnvironmentData = {
            name: "default",
            id: "6", // TODO create uuid
            parentEnvironmentId: null,
        }

       await this.provider.setValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + data.name, JSON.stringify(data));

       return {name: "default", id: "6", parentEnvironment: null}

    }

    getEnvironments(): Promise<IEnvironmentData[]> {

        //TODO - implement after provider support keyKeyRange.
        throw new Error('Method not implemented.');
    }
    async setCurrentEnvironment(environmentName: string): Promise<void> {

        const data = await this.provider.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + environmentName);

        if(!data) {
            throw new EnvironmentNotFoundError(environmentName);
        }

        const parseData = JSON.parse(data) as IEnvironmentData;
        
        if(!parseData) {
            throw new InvalidEnvironmentInfoError(environmentName);
        }

        // TODO - here the environment info has only the parent id need to iterate over the parent and build the full chain.
        this.envInfo  = {id: parseData.id, name: parseData.name, parentEnvironment: null}
 
       
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