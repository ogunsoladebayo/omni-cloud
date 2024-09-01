import { IStorageProvider } from "../../";
import { IGoogleConfig } from "../../";

export class GoogleStorage implements IStorageProvider {
	private config: IGoogleConfig;
  constructor(config: IGoogleConfig) {
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
