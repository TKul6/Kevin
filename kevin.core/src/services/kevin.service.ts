import { IEnvironmentMetaData, IEnvironmentInformation, IKevinManager, IKevinValue, IProvider } from '../interfaces'
import { EnvironmentNotFoundError, EnvironmentNotSetError, InvalidEnvironmentInfoError } from '../errors'
import { default as cloneDeep } from "lodash.clonedeep"
import { DuplicateEnvironmentFound } from '../errors/duplicate-environment-found.error';
const KEVIN_INTERNAL_ENVIRONMENT_PREFIX = "kevin.internal.environments";
const KEY_DELIMITER = ".keys.";
const ROOT_ENVIRONMENT_NAME = "root";
export class KevinService implements IKevinManager {

    private envInfo: IEnvironmentInformation;
    constructor(private provider: IProvider, info?: IEnvironmentInformation) {
        if (!provider) {
            throw new Error("Provider is required");
        }

        this.envInfo = info;
    }
    async createRootEnvironment(): Promise<IEnvironmentInformation> {
        const data: IEnvironmentMetaData = {
            name: ROOT_ENVIRONMENT_NAME,
            id: ROOT_ENVIRONMENT_NAME,
            parentEnvironmentId: null,
        }

        await this.provider.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${data.name}`, JSON.stringify(data));

        return { name: ROOT_ENVIRONMENT_NAME, id: ROOT_ENVIRONMENT_NAME, parentEnvironment: null }

    }

    async getEnvironments(): Promise<IEnvironmentMetaData[]> {

        const unparsedEnvironments = await this.provider.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".");

        if (!unparsedEnvironments || unparsedEnvironments.length === 0) {
            return [];
        }

        return unparsedEnvironments.map((unparsedEnvironment) => this.parseEnvironmentMetadata(unparsedEnvironment, KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".*"));

    }
    async setCurrentEnvironment(environmentId: string): Promise<IEnvironmentInformation> {

        const parseData = await this.getEnvironmentMetaData(environmentId);

        this.envInfo = { id: parseData.id, name: parseData.name, parentEnvironment: null }

        await this.buildEnvironmentData(this.envInfo, parseData.parentEnvironmentId);

        return cloneDeep(this.envInfo) as IEnvironmentInformation;

    }

    private async buildEnvironmentData(currentEnvironment: IEnvironmentInformation, parentEnvironmentId?: string): Promise<IEnvironmentInformation> {

        while (parentEnvironmentId) {
            const parentEnvironment = await this.getEnvironmentMetaData(parentEnvironmentId);
            currentEnvironment.parentEnvironment = { id: parentEnvironment.id, name: parentEnvironment.name, parentEnvironment: null };
            parentEnvironmentId = parentEnvironment.parentEnvironmentId;
            currentEnvironment = currentEnvironment.parentEnvironment;
        }
        return currentEnvironment;
    }

    async getValue(key: string): Promise<IKevinValue> {

        this.verifyEnvironmentIsSet();
        let currentEnvironment = this.envInfo;
        let value = await this.provider.getValue(this.getFullKey(key, currentEnvironment));

        while (!value && currentEnvironment.parentEnvironment) {
            currentEnvironment = currentEnvironment.parentEnvironment;
            value = await this.provider.getValue(this.getFullKey(key, currentEnvironment));
        }

        if (!value) {
            return null;
        }
        return { value, environmentInfo: currentEnvironment }

    }
    setValue(key: string, value: string): Promise<void> {
        this.verifyEnvironmentIsSet();
        return this.provider.setValue(this.getFullKey(key), value);
    }

    public async getEnvironmentData(): Promise<IKevinValue[]> {

        this.verifyEnvironmentIsSet();

        const rootEnvironmentKeysPrefix = ROOT_ENVIRONMENT_NAME + KEY_DELIMITER;

        const fullKeys = await this.provider.getKeys(rootEnvironmentKeysPrefix);

        const keys = fullKeys.map((fullKey) => fullKey.replace(rootEnvironmentKeysPrefix, ""));

        const results = [];
        for (const key of keys) {
            const value = await this.getValue(key);
            results.push(value);
        }
        return results;

    }

    public async createEnvironment(environmentName: string, parentEnvironmentId?: string): Promise<IEnvironmentInformation> {

        let parentId: string;

        if (parentEnvironmentId) {
            const parentEnvExists = await this.provider.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${parentEnvironmentId}`);
            if (!parentEnvExists) {
                throw new EnvironmentNotFoundError(parentEnvironmentId);

            }
            parentId = parentEnvironmentId;
        } else {
            this.verifyEnvironmentIsSet();
            parentId = this.envInfo.parentEnvironment.id;
        }

        const newEnvironment: IEnvironmentInformation = {
            name: environmentName,
            id: "",
            parentEnvironment: null
        }

        await this.buildEnvironmentData(newEnvironment, parentId);


        newEnvironment.id = this.buildEnvironmentId(newEnvironment);

        const environmentFullKey = `${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${newEnvironment.id}`;
        const envExists = await this.provider.getValue(environmentFullKey);

        if (envExists) {
            throw new DuplicateEnvironmentFound(newEnvironment.id, newEnvironment.parentEnvironment.id);
        }

        const newEnvironmentMetadata = {
            id: newEnvironment.id,
            name: newEnvironment.name,
            parentEnvironmentId: parentId
        }

        await this.provider.setValue(environmentFullKey, JSON.stringify(newEnvironmentMetadata));

        return newEnvironment;
    }

    private buildEnvironmentId(environment: IEnvironmentInformation): string {
        return this.buildEnvironmentId(environment.parentEnvironment) + "/" + environment.name;
    }

    private getFullKey(key: string, environment: IEnvironmentInformation = this.envInfo): string {
        return environment.id + KEY_DELIMITER + key;
    }

    private async getEnvironmentMetaData(environmentId: string): Promise<IEnvironmentMetaData> {
        const data = await this.provider.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + environmentId);

        if (!data) {
            throw new EnvironmentNotFoundError(environmentId);
        }

        return this.parseEnvironmentMetadata(data, environmentId);
    }


    private parseEnvironmentMetadata(data: string, environmentName?: string) {
        try {
            const parseData = JSON.parse(data) as IEnvironmentMetaData;
            if (parseData) {
                return parseData;
            }

            throw new InvalidEnvironmentInfoError(environmentName);

        } catch (error) {
            throw new InvalidEnvironmentInfoError(environmentName);
        }
    }

    private verifyEnvironmentIsSet() {
        if (!this.envInfo) {
            throw new EnvironmentNotSetError();
        }
    }
}