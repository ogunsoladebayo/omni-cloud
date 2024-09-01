import { IStorageProvider } from '../../';
import { IAzureConfig } from "../../";

export class AzureStorage implements IStorageProvider {
  private config: IAzureConfig;
  constructor(config: IAzureConfig) {
	this.config = config;
  }

  deleteFile(filePath: string): Promise<void> {
	return Promise.resolve(undefined);
  }

  downloadFile(remotePath: string, localPath: string): Promise<void> {
	return Promise.resolve(undefined);
  }

  uploadFile(localPath: string, remotePath: string): Promise<any> {
	return Promise.resolve(undefined);
  }
}
