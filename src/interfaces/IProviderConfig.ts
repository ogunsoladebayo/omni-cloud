import { IAwsConfig } from ".";
import { IGoogleConfig } from '.';
import { IAzureConfig } from '.';

export type Provider = 'aws' | 'google' | 'azure';

export interface IProviderConfig {
  provider: Provider;
  aws?: IAwsConfig;
  google?: IGoogleConfig;
  azure?: IAzureConfig;
}