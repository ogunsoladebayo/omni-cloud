import { IStorageProvider } from '../interfaces/IStorageProvider';
import { AwsStorage } from '../providers/aws/AwsStorage';
import { GoogleStorage } from '../providers/google/GoogleStorage';
import { AzureStorage } from '../providers/azure/AzureStorage';
import { IProviderConfig } from '../interfaces/IProviderConfig';
import { ErrorHandler } from '../utils/ErrorHandler';

export class ProviderFactory {
	static createProvider (config: IProviderConfig): IStorageProvider {
		switch (config.provider) {
			case 'aws':
				if (!config.aws) {
					throw new ErrorHandler('AwsProvider', 'AWS configuration is required', 401)
				}
				return new AwsStorage(config.aws);

			case 'google':
				if (!config.google) {
					throw new ErrorHandler('GoogleProvider', 'Google Cloud Storage configuration is required', 401);
				}
				return new GoogleStorage(config.google);

			case 'azure':
				if (!config.azure) {
					throw new ErrorHandler('AzureProvider', 'Azure Blob Storage configuration is required', 401);
				}
				return new AzureStorage(config.azure);

			default:
				throw new ErrorHandler('Undefined', `Unsupported provider: ${ config.provider }`,400);
		}
	}
}
