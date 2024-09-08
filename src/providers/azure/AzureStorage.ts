import axios from 'axios';
import { IAzureConfig, IStorageProvider } from '../..';
import { readFile } from 'fs/promises';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

interface RequestConfig {
  url: string;
  config: {
    headers: {
      'Authorization': string;
      'x-ms-date': string;
      'x-ms-version': string;
    };
  };
}

export class AzureStorage implements IStorageProvider {
  private readonly accountName: string;
  private accountKey: string;
  private readonly containerName: string;

  constructor (config: IAzureConfig) {
    this.accountName = config.accountName;
    this.accountKey = config.accountKey;
    this.containerName = config.containerName;
  }

  async uploadFile (localPath: string, remotePath: string): Promise<void> {
    const fileContent = await readFile(localPath);
    const config = this.getRequestConfig('PUT', remotePath, fileContent.length);

    await axios.put(config.url, fileContent, { headers: { ...config.config.headers, 'x-ms-blob-type': 'BlockBlob' } });
  }

  async downloadFile (remotePath: string, localPath: string): Promise<void> {
    const config = this.getRequestConfig('GET', remotePath);

    const response = await axios.get(config.url, { headers: config.config.headers });
    const writer = fs.createWriteStream(localPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async deleteFile (filePath: string): Promise<void> {
    const config = this.getRequestConfig('DELETE', filePath);

    await axios.delete(config.url, { headers: config.config.headers });
  }

  private getCanonicalizedHeaders (headers: any): string {
    return Object.keys(headers).map(key => `${ key }:${ headers[ key ] }\n`).join('');
  }

  private getRequestConfig (verb: string, remotePath: string, contentLength: number = 0): RequestConfig {
    const now = new Date().toUTCString();
    // formulate canonicalized headers based on the request headers
    const headers: any = {};
    if (contentLength) {
      headers[ 'x-ms-blob-type' ] = 'BlockBlob';
    }
    headers[ 'x-ms-date' ] = now;
    headers[ 'x-ms-version' ] = '2020-10-02';
    const canonicalizedHeaders = this.getCanonicalizedHeaders(headers);
    const canonicalizedResource = `/${ this.accountName }/${ this.containerName }/${ remotePath }`;
    const stringToSign = verb + '\n' + // VERB
      '\n' + // Content-Encoding
      '\n' + // Content-Language
      ( verb === 'PUT' ? contentLength : '' ) + '\n' + // Content-Length
      '\n' + // Content-MD5
      ( contentLength ? 'application/x-www-form-urlencoded' : '' ) + '\n' + // Content-Type
      '\n' + // Date
      '\n' + // If-Modified-Since
      '\n' + // If-Match
      '\n' + // If-None-Match
      '\n' + // If-Unmodified-Since
      '\n' + // Range
      canonicalizedHeaders + // CanonicalizedHeaders
      canonicalizedResource; // CanonicalizedResource
    console.log({ stringToSign });
    const signature = crypto.createHmac('sha256', Buffer.from(this.accountKey, 'base64')).update(stringToSign).digest('base64');
    const authorization = `SharedKey ${ this.accountName }:${ signature }`;

    return {
      url: `https://${ this.accountName }.blob.core.windows.net/${ this.containerName }/${ remotePath }`,
      config: {
        headers: {
          'x-ms-date': now,
          'x-ms-version': '2020-10-02',
          'Authorization': authorization,
        },
      },
    };
  }
}
