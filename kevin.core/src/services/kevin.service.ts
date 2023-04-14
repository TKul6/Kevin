import { type IEnvironmentMetaData, type IEnvironmentInformation, type IKevinManager, type IKevinValue, type IProvider } from '../interfaces'
import { DuplicateKeyFoundError, EnvironmentNotFoundError, EnvironmentNotSetError, InvalidEnvironmentInfoError } from '../errors'
import cloneDeep from "lodash.clonedeep"
import { DuplicateEnvironmentFound } from '../errors/duplicate-environment-found.error';
const ROOT_ENVIRONMENT_NAME = "root";
const DEFAULT_DELIMITER = ".";
export class KevinService implements IKevinManager {

  private readonly delimiter: string;
  private envInfo: IEnvironmentInformation;
  private readonly internalEnvironmentsPrefix: string;
  private readonly keysDelimiter: string;
  private readonly keysPrefix: string;
  constructor(private readonly provider: IProvider, info?: IEnvironmentInformation) {
    if (!provider) {
      throw new Error("Provider is required");
    }

    this.envInfo = info;
    this.delimiter = provider.getDelimiter() || DEFAULT_DELIMITER;
    this.internalEnvironmentsPrefix = ["kevin", "internal", "environments"].join(this.delimiter);
    this.keysDelimiter = this.delimiter + "keys" + this.delimiter;
    this.keysPrefix = "kevin" + this.delimiter;

  }

  async createRootEnvironment(): Promise<IEnvironmentInformation> {
    const data: IEnvironmentMetaData = {
      name: ROOT_ENVIRONMENT_NAME,
      id: ROOT_ENVIRONMENT_NAME,
      parentEnvironmentId: null,
    }

    await this.provider.setValue(`${this.internalEnvironmentsPrefix}${this.delimiter}${data.name}`, JSON.stringify(data));

    return { name: ROOT_ENVIRONMENT_NAME, id: ROOT_ENVIRONMENT_NAME, parentEnvironment: null }

  }

  async getEnvironments(): Promise<IEnvironmentMetaData[]> {

    const unparsedEnvironments = await this.provider.getValueRange(this.internalEnvironmentsPrefix + this.delimiter);

    if (!unparsedEnvironments || unparsedEnvironments.length === 0) {
      return [];
    }

    return unparsedEnvironments.map((unparsedEnvironment) => this.parseEnvironmentMetadata(unparsedEnvironment, this.internalEnvironmentsPrefix + this.delimiter + "*"));

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
    const loweredKey = key.toLowerCase();
    let value = await this.provider.getValue(this.getFullKey(loweredKey, currentEnvironment));

    while (!value && currentEnvironment.parentEnvironment) {
      currentEnvironment = currentEnvironment.parentEnvironment;
      value = await this.provider.getValue(this.getFullKey(loweredKey, currentEnvironment));
    }

    if (!value) {
      return null;
    }
    return { value, environmentInfo: currentEnvironment, key: loweredKey };

  }

  async setValue(key: string, value: string): Promise<void> {
    this.verifyEnvironmentIsSet();
    await this.provider.setValue(this.getFullKey(key), value);
  }

  public async getEnvironmentData(): Promise<IKevinValue[]> {

    this.verifyEnvironmentIsSet();

    const rootEnvironmentKeysPrefix = `${this.keysPrefix}${ROOT_ENVIRONMENT_NAME}${this.keysDelimiter}`;

    const fullKeys = await this.provider.getKeys(rootEnvironmentKeysPrefix);

    const keys = fullKeys.map((fullKey) => fullKey.replace(rootEnvironmentKeysPrefix, ""));

    const results = [];
    for (const key of keys) {
      const value = await this.getValue(key);
      results.push(value);
    }
    return results;

  }

  public async createEnvironment(environmentName: string, parentEnvironmentId?: string): Promise<IEnvironmentMetaData> {

    let parentId: string;

    if (parentEnvironmentId) {
      const parentEnvExists = await this.provider.hasKey(this.getFullEnvironmentKey(parentEnvironmentId));
      if (!parentEnvExists) {
        throw new EnvironmentNotFoundError(parentEnvironmentId);

      }
      parentId = parentEnvironmentId;
    } else {
      this.verifyEnvironmentIsSet();
      parentId = this.envInfo.id;
    }

    const newEnvironmentMetadata = {
      id: `${parentId}/${this.cleanName(environmentName)}`,
      name: environmentName,
      parentEnvironmentId: parentId
    }

    const environmentFullKey = this.getFullEnvironmentKey(newEnvironmentMetadata.id);
    const envExists = await this.provider.hasKey(environmentFullKey);

    if (envExists) {
      throw new DuplicateEnvironmentFound(newEnvironmentMetadata.id, parentId);
    }

    await this.provider.setValue(environmentFullKey, JSON.stringify(newEnvironmentMetadata));

    return newEnvironmentMetadata;
  }


  public async addKey(key: string, value: string, defaultValue = ""): Promise<void> {
    this.verifyEnvironmentIsSet();

    const currentValue = await this.getValue(key);
    if (currentValue) {
      throw new DuplicateKeyFoundError(currentValue);

    }
    const promises = [this.provider.setValue(this.getFullKey(key), value)];

    if (this.envInfo.id !== ROOT_ENVIRONMENT_NAME) {
      promises.push(this.provider.setValue(this.getFullKeyByEnvironmentId(key, ROOT_ENVIRONMENT_NAME), defaultValue));
    }

    await Promise.all(promises)
  }


  private getFullEnvironmentKey(environmentId: string): string {
    return `${this.internalEnvironmentsPrefix}${this.delimiter}${environmentId}`;
  }

  private cleanName(name: string): string {
    return name.replace(/\//g, "_").replace(/ /g, "_").toLowerCase();
  }

  private getFullKey(key: string, environment: IEnvironmentInformation = this.envInfo): string {
    return this.getFullKeyByEnvironmentId(key, environment.id);
  }

  private getFullKeyByEnvironmentId(key: string, environmentId: string): string {
    return `${this.keysPrefix}${environmentId}${this.keysDelimiter}${key.toLocaleLowerCase()}`;
  }

  private async getEnvironmentMetaData(environmentId: string): Promise<IEnvironmentMetaData> {
    const data = await this.provider.getValue(this.internalEnvironmentsPrefix + this.delimiter + environmentId);

    if (!data) {
      throw new EnvironmentNotFoundError(environmentId);
    }

    return this.parseEnvironmentMetadata(data, environmentId);
  }


  private parseEnvironmentMetadata(data: string, environmentName?: string): IEnvironmentMetaData {
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

  private verifyEnvironmentIsSet(): void {
    if (!this.envInfo) {
      throw new EnvironmentNotSetError();
    }
  }

}