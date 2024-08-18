import { IStorageProvider } from "../../interfaces/IStorageProvider";
import { IAwsConfig } from "../../interfaces/IAwsConfig";


export class AwsStorage implements IStorageProvider {
	private config: IAwsConfig;
	constructor (config: IAwsConfig) {
		this.config = config;
	}

	deleteFile (filePath: string): Promise<void> {
		return Promise.resolve(undefined);
	}

	downloadFile (remotePath: string, localPath: string): Promise<void> {
		return Promise.resolve(undefined);
	}

	listFiles (directoryPath: string): Promise<string[]> {
		return Promise.resolve([]);
	}

	uploadFile (localPath: string, remotePath: string): Promise<any> {
		return Promise.resolve(undefined);
	}
}
