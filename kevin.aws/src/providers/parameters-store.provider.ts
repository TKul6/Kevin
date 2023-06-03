import { type IProvider } from '@kevin-infra/core/interfaces';
import {
  DeleteParameterCommand,
  GetParameterCommand,
  GetParametersByPathCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

export class AwsParametersStoreProvider
  implements IProvider {
  private readonly client: SSMClient;

  constructor(
    config: ParametersStoreConfig
  ) {
    if (config.client) {
      this.client = config.client;
    } else {
      this.client = new SSMClient({
        region: config.region,
      });
    }
  }

  async getValue(
    key: string
  ): Promise<string> {
    const fullKey = key.startsWith('/')
      ? key
      : `/${key}`;
    const command =
      new GetParameterCommand({
        Name: fullKey,
        WithDecryption: true,
      });

    try {
      const response =
        await this.client.send(command);

      return response.Parameter.Value;
    } catch { }
    return null;
  }

  async setValue(
    key: string,
    value: string
  ): Promise<void> {
    const fullKey = key.startsWith('/')
      ? key
      : `/${key}`;
    await this.client.send(
      new PutParameterCommand({
        Name: fullKey,
        Value: value,
        Type: 'String',
        Overwrite: true,
      })
    );
  }

  async getValueRange(
    keyPrefix: string
  ): Promise<string[]> {
    const keys = await this.getKeys(
      keyPrefix
    );

    const promises = keys
      .map(
        async (key) =>
          await this.client.send(
            new GetParameterCommand({
              Name: `/${key}`,
              WithDecryption: true,
            })
          )
      )
      .map(
        async (promise) =>
          await promise.then(
            (r) => r.Parameter.Value
          )
      );

    return await Promise.all(promises);
  }

  async getKeys(
    keyPrefix: string
  ): Promise<string[]> {
    const command =
      new GetParametersByPathCommand({
        Path: `/${keyPrefix}`,
        Recursive: true,
        WithDecryption: true,
      });

    const response =
      await this.client.send(command);
    return response.Parameters.map(
      (p) => p.Name.slice(1)
    );
  }

  async hasKey(
    key: string
  ): Promise<boolean> {
    const value = await this.getValue(
      key
    );

    return value != null;
  }

  public async deleteKey(key: string): Promise<any> {
    const command = new DeleteParameterCommand({
      Name: key,
    });

    return await this.client.send(command);
  }


  getDelimiter(): string {
    return '/';
  }
}

export interface ParametersStoreConfig {
  client?: SSMClient;
  region: string;
}
