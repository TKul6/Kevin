import { Service } from 'typedi';
import { type ProviderFactory } from './factory';
import { type IProvider } from '@kevin-infra/core/interfaces';

const AWS_IMPORT = '@kevin-infra/aws';

@Service('provider.aws.parameter-store.factory')
export class AwsParameterStoreProviderFactory implements ProviderFactory {
  async create(): Promise<IProvider> {
    const awsRegion = process.env.AWS_REGION;

    if (!awsRegion) {
      console.error('Could not locate aws region. Please set AWS_REGION environment variable.');
      throw new Error('Aws region could not found');
    }

    const { AwsParametersStoreProvider } = await import(AWS_IMPORT);
    return new AwsParametersStoreProvider({ region: awsRegion });
  }
}
