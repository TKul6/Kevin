import { IEnvironmentMetaData, IEnvironmentInformation, IKevinManager, IKevinValue, IProvider } from '../interfaces'
import { EnvironmentNotFoundError, EnvironmentNotSetError, InvalidEnvironmentInfoError } from '../errors'
import { default as cloneDeep } from "lodash.clonedeep"
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
    async setCurrentEnvironment(environmentName: string): Promise<IEnvironmentInformation> {

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

        return cloneDeep(this.envInfo) as IEnvironmentInformation;

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

    private getFullKey(key: string, environment: IEnvironmentInformation = this.envInfo): string {
        return environment.id + KEY_DELIMITER + key;
    }

    private async getEnvironmentMetaData(environmentName: string): Promise<IEnvironmentMetaData> {
        const data = await this.provider.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + environmentName);

        if (!data) {
            throw new EnvironmentNotFoundError(environmentName);
        }

        return this.parseEnvironmentMetadata(data, environmentName);
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