import { IProvider } from '@kevin-infra/core/interfaces';

export interface ProviderFactory {
create(): Promise<IProvider>;
}
  