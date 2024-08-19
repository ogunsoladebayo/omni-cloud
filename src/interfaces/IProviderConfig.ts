import { IAwsConfig } from './IAwsConfig';
import { IGoogleConfig } from './IGoogleConfig';
import { IAzureConfig } from './IAzureConfig';

export interface IProviderConfig {
  provider: 'aws' | 'google' | 'azure';
  aws?: IAwsConfig;
  google?: IGoogleConfig;
  azure?: IAzureConfig;
}
