import { IAwsConfig } from ".";
import { IGoogleConfig } from '.';
import { IAzureConfig } from '.';

export interface IProviderConfig {
  provider: Provider;
  aws?: IAwsConfig;
  google?: IGoogleConfig;
  azure?: IAzureConfig;
}

export type Provider = 'aws' | 'google' | 'azure';
