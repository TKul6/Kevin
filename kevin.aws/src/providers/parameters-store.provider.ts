import { type IProvider } from "@kevin-infra/core/interfaces"
import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm"
import { GetParametersByPathCommand } from "@aws-sdk/client-ssm/dist-types/commands";


export class RedisProvider implements IProvider {

    private readonly client: SSMClient;

    constructor(config: ParametersStoreConfig) {

        if (config.client) {
            this.client = config.client;
        } else {
            this.client = new SSMClient({ region: config.region });
        }
    }

    async getValue(key: string): Promise<string> {

        const command = new GetParameterCommand({ Name: key, WithDecryption: true });

        const response = await this.client.send(command);

        return response.Parameter.Value;
    }

    async setValue(key: string, value: string): Promise<void> {

        await this.client.send(new PutParameterCommand({ Name: key, Value: value, Type: "String", Overwrite: true }))
    }

    async getValueRange(keyPrefix: string): Promise<string[]> {

        const keys = await this.getKeys(keyPrefix);

        const promises = keys.map(async key => await this.client.send(new GetParameterCommand({ Name: key, WithDecryption: true })))
            .map(async promise => await promise.then(r => r.Parameter.Value));

        return await Promise.all(promises);
    }

    async getKeys(keyPrefix: string): Promise<string[]> {

        const command = new GetParametersByPathCommand({ Path: keyPrefix, Recursive: true, WithDecryption: true })

        const response = await this.client.send(command);
        return response.Parameters.map(p => p.Name);
    }

    async hasKey(key: string): Promise<boolean> {
        try {
            await this.getValue(key);
            return true;
        } catch { }
        return false;

    }

    getDelimiter(): string {
        return "/";
    }

}

export interface ParametersStoreConfig {
    client?: SSMClient
    region: string
}