# OmniCloud

**OmniCloud** is a unified interface for interacting with multiple cloud storage providers. This package simplifies the
process of managing files across different cloud storage services by providing a single, consistent API.

## Features

- [x] Unified API for multiple cloud storage providers
- [x] Upload files from the local filesystem, buffer, or stream
- [x] Download files to the local filesystem, buffer, or stream
- [x] Delete files
- [x] TypeScript support
- [x] Easy configuration setup
- [x] Built in support for AWS S3
- [x] Built in support for Azure Blob Storage
- [x] Built in support for Google Cloud Storage
- [x] Standardized error handling
- [ ] Pluggable architecture for adding custom providers

## Installation

To install the package, use npm or yarn:

```bash
npm install omni-cloud
```

or

```bash
yarn add omni-cloud
```

## Usage

### Configuration

Configure OmniCloud with the necessary credentials for your chosen cloud storage providers.

```javascript
import { ProviderFactory, IStorageProvider } from 'omni-cloud';

const storageConfig = {
  provider: 'aws',
  aws: {
    credentials: {
    accessKeyId: 'your-access-key-id',
    secretAccessKey: 'your-secret-access-key',
    },
    region: 'your-region',
    bucketName: 'your-bucket-name',
  },
};

const storage: IStorageProvider = ProviderFactory.createProvider(storageConfig);

```

### Upload a File

#### From File System

```javascript
async function uploadFileFromFileSystem() {
  try {
    await storage.uploadFile('path/to/local/file.txt', 'remote/file.txt');
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
```

#### From Buffer

```javascript
async function uploadFileFromBuffer(fileBuffer) {
  try {
    await storage.uploadFile(fileBuffer, 'remote/file.txt');
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
```

#### From Stream

```javascript
async function uploadFileFromStream(fileStream) {
  try {
    await storage.uploadFile(fileStream, 'remote/file.txt');
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
```

### Download a File

#### To File System

```javascript
async function downloadFileToFileSystem() {
  await storage.downloadFile('remote/file.txt', { type: 'file', destination: 'path/to/local/file.txt' });
  console.log('File downloaded successfully');
}
```

#### To Buffer

```javascript
async function downloadFileToBuffer() {
  return await storage.downloadFile('remote/file.txt', { type: 'buffer' });
}
```

#### To Stream

```javascript
import * as fs from 'node:fs';

async function downloadFileToStream() {
  return await storage.downloadFile('remote/file.txt', { type: 'stream' });
}
```

### Delete a File

```javascript
async function deleteFile() {
  await storage.delete('remote/file.txt');
  console.log('File deleted successfully');
}
```

## API

### `ProviderFactory.createProvider(config: IStorageConfig): IStorageProvider`

Creates a new instance of a cloud storage provider based on the specified configuration.

### `uploadFile(source: string | Buffer | Stream, destination: string): Promise`

Uploads a file from the local filesystem, buffer, or stream to the specified remote path in the configured cloud storage
provider.

### `downloadFile(remotePath: string, options: { type: 'buffer' | 'stream' | 'file', destination?: string }): Promise`

Downloads a file from the specified remote path in the configured cloud storage provider to the local filesystem,
buffer, or stream.

### `delete(filePath: string): Promise`

Deletes the file at the specified path in the configured cloud storage provider.

## Contributing

Contributions are welcome! Follow guide [here](CONTRIBUTING.md)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Special thanks to all contributors and supporters of this project.

