import { IAwsConfig } from ".";
import { IGoogleConfig } from '.';
import { IAzureConfig } from '.';

export interface IProviderConfig {
  provider: 'aws' | 'google' | 'azure';
  aws?: IAwsConfig;
  google?: IGoogleConfig;
  azure?: IAzureConfig;
}
