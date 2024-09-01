import { IStorageProvider } from '../interfaces/IStorageProvider';
import { AwsStorage } from '../providers/aws/AwsStorage';
import { GoogleStorage } from '../providers/google/GoogleStorage';
import { AzureStorage } from '../providers/azure/AzureStorage';
import { IProviderConfig } from '../interfaces/IProviderConfig';

export class ProviderFactory {
	static createProvider (config: IProviderConfig): IStorageProvider {
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
