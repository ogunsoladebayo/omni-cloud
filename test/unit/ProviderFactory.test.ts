import { describe, test, expect } from 'bun:test';
import { ProviderFactory } from '../../src/providers/ProviderFactory';
import { AwsStorage } from '../../src/providers/aws/AwsStorage';
import { AzureStorage } from '../../src/providers/azure/AzureStorage';
import { GoogleStorage } from '../../src/providers/google/GoogleStorage';

describe('ProviderFactory', () => {
  test('should return an instance of AzureStorage for \'aws\'', () => {
    const storageProvider = ProviderFactory.createProvider({
      provider: 'aws',
      aws: {
        bucketName: 'bucket',
        region: 'region',
        credentials: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
        },
      },
    });
    expect(storageProvider).toBeInstanceOf(AwsStorage);
  });

  test('should return an instance of AzureStorage for \'azure\'', () => {
    const storageProvider = ProviderFactory.createProvider({
      provider: 'azure',
      azure: {
        credentials: {
          accountKey: 'accountKey',
          accountName: 'accountName',
        },
        containerName: 'containerName',
      },
    });
    expect(storageProvider).toBeInstanceOf(AzureStorage);
  });

  test('should return an instance of GoogleStorage for \'google\'', () => {
    const storageProvider = ProviderFactory.createProvider({
      provider: 'google',
      google: {
        bucketName: 'bucketName',
        credentials: {
          clientEmail: 'client_email',
          privateKey: 'private_key',
        },
      },
    });
    expect(storageProvider).toBeInstanceOf(GoogleStorage);
  });
});
