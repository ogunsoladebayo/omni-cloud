import axios from 'axios';
import { IAzureConfig, IStorageProvider } from '../..';
import { readFile } from 'fs/promises';
import * as fs from 'node:fs';
import { ReadStream } from 'node:fs';
import * as crypto from 'node:crypto';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { streamToBuffer } from '../../utils/Helpers';
import { IDownloadOptions } from '../../interfaces/IStorageProvider';
import { Stream } from 'node:stream';

interface RequestConfig {
  url: string;
  config: {
    headers: {
      Authorization: string;
      'x-ms-date': string;
      'x-ms-version': string;
    };
  };
}

export class AzureStorage implements IStorageProvider {
  private config: IAzureConfig;

  constructor(config: IAzureConfig) {
    this.config = config;
  }

  async uploadFile(source: string | Buffer | ReadStream, remotePath: string): Promise<void> {
    try {
      let fileContent: Buffer;
      if (typeof source === 'string') {
        fileContent = await readFile(source);
      } else if (source instanceof ReadStream) {
        fileContent = await streamToBuffer(source);
      } else {
        fileContent = source;
      }
      const config = this.getRequestConfig('PUT', remotePath, fileContent.length);

      await axios.put(config.url, fileContent, { headers: { ...config.config.headers, 'x-ms-blob-type': 'BlockBlob' } });
    } catch (error: any) {
      throw new ErrorHandler('azure', 'NetworkError', `Failed to upload file`, error.response?.status, error.response?.data);
    }
  }

  async downloadFile(remotePath: string, options: { type: 'buffer' } & IDownloadOptions): Promise<Buffer>;
  async downloadFile(remotePath: string, options: { type: 'stream' } & IDownloadOptions): Promise<Stream>;
  async downloadFile(remotePath: string, destination: string, options?: Omit<IDownloadOptions, 'type'>): Promise<void>;
  async downloadFile(
    remotePath: string,
    destinationOrOptions?: string | IDownloadOptions,
    options?: IDownloadOptions
  ): Promise<Buffer | Stream | void> {
    const destination = typeof destinationOrOptions === 'string' ? destinationOrOptions : undefined;
    const opts = typeof destinationOrOptions === 'object' ? destinationOrOptions : options;

    try {
      const config = this.getRequestConfig('GET', remotePath);

      if (opts?.type === 'buffer') {
        const response = await axios.get(config.url, { headers: config.config.headers, responseType: 'arraybuffer' });
        return response.data;
      } else {
        const response = await axios.get(config.url, { headers: config.config.headers, responseType: 'stream' });
        if (response.status === 200) {
          if (destination) {
            const writer = fs.createWriteStream(destination);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', (err: any) =>
                reject(new ErrorHandler('azure', 'NetworkError', 'File downloading failed', err.status, err.data))
              );
            });
          }
          return response.data;
        }
      }
    } catch (error: any) {
      throw new ErrorHandler('azure', 'NetworkError', `failed to download File`, error.response?.status, error.response?.data);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const config = this.getRequestConfig('DELETE', filePath);
      await axios.delete(config.url, { headers: config.config.headers });
    } catch (error: any) {
      throw new ErrorHandler('azure', 'FileDeletionError', `failed to delete File`, error.response?.status || 404, error.response?.data);
    }
  }

  private getCanonicalizedHeaders(headers: any): string {
    return Object.keys(headers)
      .map((key) => `${key}:${headers[key]}\n`)
      .join('');
  }

  private getRequestConfig(verb: string, remotePath: string, contentLength: number = 0): RequestConfig {
    try {
      const now = new Date().toUTCString();
      // formulate canonicalized headers based on the request headers
      const headers: any = {};
      if (contentLength) {
        headers['x-ms-blob-type'] = 'BlockBlob';
      }
      headers['x-ms-date'] = now;
      headers['x-ms-version'] = '2020-10-02';
      const canonicalizedHeaders = this.getCanonicalizedHeaders(headers);
      const canonicalizedResource = `/${this.config.credentials.accountName}/${this.config.containerName}/${remotePath}`;
      const stringToSign =
        verb +
        '\n' + // VERB
        '\n' + // Content-Encoding
        '\n' + // Content-Language
        (verb === 'PUT' ? contentLength : '') +
        '\n' + // Content-Length
        '\n' + // Content-MD5
        (contentLength ? 'application/x-www-form-urlencoded' : '') +
        '\n' + // Content-Type
        '\n' + // Date
        '\n' + // If-Modified-Since
        '\n' + // If-Match
        '\n' + // If-None-Match
        '\n' + // If-Unmodified-Since
        '\n' + // Range
        canonicalizedHeaders + // CanonicalizedHeaders
        canonicalizedResource; // CanonicalizedResource
      const signature = crypto
        .createHmac('sha256', Buffer.from(this.config.credentials.accountKey, 'base64'))
        .update(stringToSign)
        .digest('base64');
      const authorization = `SharedKey ${this.config.credentials.accountName}:${signature}`;

      return {
        url: `https://${this.config.credentials.accountName}.blob.core.windows.net/${this.config.containerName}/${remotePath}`,
        config: {
          headers: {
            'x-ms-date': now,
            'x-ms-version': '2020-10-02',
            Authorization: authorization,
          },
        },
      };
    } catch (error: any) {
      throw new ErrorHandler('azure', 'ConfigurationError', `Failed to get request config`, error.response.status, error.response.data);
    }
  }
}
