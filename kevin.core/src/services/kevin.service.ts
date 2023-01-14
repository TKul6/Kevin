import { IEnvironmentMetaData, IEnvironmentInformation, IKevinManager, IKevinValue, IProvider } from '../interfaces'
import { EnvironmentNotFoundError, InvalidEnvironmentInfoError } from '../errors'
const KEVIN_INTERNAL_ENVIRONMENT_PREFIX = "kevin.internal.environments";
const KEY_DELIMITER = ".keys.";
const DEFAULT_ENVIRONMENT_NAME = "default";
export class KevinService implements IKevinManager {

    private envInfo: IEnvironmentInformation;
    constructor(private provider: IProvider) {

        if (!provider) {
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

        return { name: DEFAULT_ENVIRONMENT_NAME, id: DEFAULT_ENVIRONMENT_NAME, parentEnvironment: null }

    }

    async getEnvironments(): Promise<IEnvironmentMetaData[]> {

        const unparsedEnvironments = await this.provider.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".");

        if (!unparsedEnvironments || unparsedEnvironments.length === 0) {
            return [];
        }

        return unparsedEnvironments.map((unparsedEnvironment) => JSON.parse(unparsedEnvironment) as IEnvironmentMetaData);
    }
    async setCurrentEnvironment(environmentName: string): Promise<void> {

        const parseData = await this.getEnvironmentMetaData(environmentName);

        this.envInfo = { id: parseData.id, name: parseData.name, parentEnvironment: null }

        let parentEnvironmentId = parseData.parentEnvironmentId;
        let currentEnvironment = this.envInfo;
        while (parentEnvironmentId) {
            const parentEnvironment = await this.getEnvironmentMetaData(parentEnvironmentId);
            currentEnvironment.parentEnvironment = { id: parentEnvironment.id, name: parentEnvironment.name, parentEnvironment: null };
            parentEnvironmentId = parentEnvironment.parentEnvironmentId;
            currentEnvironment = currentEnvironment.parentEnvironment;

        }

    }

    async getValue(key: string): Promise<IKevinValue> {
        let currentEnvironment = this.envInfo;
        let value = await this.provider.getValue(this.getFullKey(key, currentEnvironment));

        while (!value && this.envInfo.parentEnvironment) {
            currentEnvironment = currentEnvironment.parentEnvironment;
            value = await this.provider.getValue(this.getFullKey(key, currentEnvironment));
        }

        if (!value) {
            return null;
        }
        return { value, environmentInfo: currentEnvironment }

    }
    setValue(key: string, value: string): Promise<void> {
        return this.provider.setValue(this.getFullKey(key), value);
    }

    public async getEnvironmentData(): Promise<IKevinValue[]> {

        const defaultEnvironmentKeysPrefix = DEFAULT_ENVIRONMENT_NAME + KEY_DELIMITER;

        const fullKeys = await this.provider.getKeys(defaultEnvironmentKeysPrefix);

        const keys = fullKeys.map((fullKey) => fullKey.replace(defaultEnvironmentKeysPrefix, ""));

        const results = [];
        for (const key of keys) {
            const value = await this.getValue(key);
            results.push(value);
        }
        return results;

    }

    private getFullKey(key: string, environment: IEnvironmentInformation = this.envInfo): string {
        return environment.id + KEY_DELIMITER + key;
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

}