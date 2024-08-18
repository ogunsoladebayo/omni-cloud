import { IStorageProvider } from '../interfaces/IStorageProvider';
import { AwsStorage } from './aws/AwsStorage';
import { GoogleStorage } from './google/GoogleStorage';
import { AzureStorage } from './azure/AzureStorage';
import { IAwsConfig } from "../interfaces/IAwsConfig";
import { IGoogleConfig } from "../interfaces/IGoogleConfig";
import { IAzureConfig } from "../interfaces/IAzureConfig";

interface ProviderConfig {
	provider: 'aws' | 'google' | 'azure';
	aws?: IAwsConfig;
	google?: IGoogleConfig;
	azure?: IAzureConfig
}

export class ProviderFactory {
	static createProvider (config: ProviderConfig): IStorageProvider {
		switch (config.provider) {
			case 'aws':
				if (!config.aws) {
					throw new Error('AWS configuration is required');
				}
				return new AwsStorage(config.aws);

			case 'google':
				if (!config.google) {
					throw new Error('Google Cloud Storage configuration is required');
				}
				return new GoogleStorage(config.google);

			case 'azure':
				if (!config.azure) {
					throw new Error('Azure Blob Storage configuration is required');
				}
				return new AzureStorage(config.azure);

			default:
				throw new Error(`Unsupported provider: ${ config.provider }`);
		}
	}
}
