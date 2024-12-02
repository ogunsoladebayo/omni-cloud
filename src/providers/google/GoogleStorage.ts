import { IGoogleConfig, IStorageProvider } from '../../';
import * as crypto from 'node:crypto';
import axios from 'axios';
import { readFile } from 'fs/promises';
import * as fs from 'node:fs';
import { ReadStream } from 'node:fs';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { IDownloadOptions } from '../../interfaces/IStorageProvider';
import { streamToBuffer } from '../../utils/Helpers';
import { Stream } from 'node:stream';

export class GoogleStorage implements IStorageProvider {
  private config: IGoogleConfig;

  constructor(config: IGoogleConfig) {
    this.config = config;
  }

  async uploadFile(source: string | Buffer | ReadStream, remotePath: string): Promise<any> {
    try {
      let fileContent: Buffer;
      if (typeof source === 'string') {
        fileContent = await readFile(source);
      } else if (source instanceof ReadStream) {
        fileContent = await streamToBuffer(source);
      } else {
        fileContent = source;
      }

      const url = `https://storage.googleapis.com/upload/storage/v1/b/${this.config.bucketName}/o?uploadType=media&name=${remotePath}`;
      const token = await this.getAccessToken(this.config.credentials.client_email, this.config.credentials.private_key);

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      };

      const response = await axios.post(url, fileContent, { headers });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error: any) {
      throw new ErrorHandler('google', 'NetworkError', `Failed to upload file`, error.status, error.data || error);
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
      const url = `https://storage.googleapis.com/storage/v1/b/${this.config.bucketName}/o/${encodeURIComponent(remotePath)}?alt=media`;
      const token = await this.getAccessToken(this.config.credentials.client_email, this.config.credentials.private_key);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (opts?.type === 'buffer') {
        const response = await axios.get(url, { headers, responseType: 'arraybuffer' });
        return response.data;
      } else {
        const response = await axios.get(url, { headers, responseType: 'stream' });
        if (response.status === 200) {
          if (destination) {
            const writer = fs.createWriteStream(destination);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', (err: any) =>
                reject(new ErrorHandler('google', 'NetworkError', 'File downloading failed', err.status, err.data))
              );
            });
          }
          return response.data;
        }
      }
    } catch (error: any) {
      throw new ErrorHandler('google', 'NetworkError', `Failed to download file`, error.response?.status, error.response?.data);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const url = `https://storage.googleapis.com/storage/v1/b/${this.config.bucketName}/o/${encodeURIComponent(filePath)}`;
      const token = await this.getAccessToken(this.config.credentials.client_email, this.config.credentials.private_key);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.delete(url, { headers });
      if (response.status === 204) {
        return response.data;
      }
    } catch (error: any) {
      throw new ErrorHandler('google', 'NetworkError', `Failed to delete file`, error.response?.status, error.response?.data);
    }
  }

  private createJWT(clientEmail: string, privateKey: string) {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/devstorage.full_control',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour expiration
      iat: now,
    };

    // Base64URL encode the header and payload
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = Buffer.from(JSON.stringify(payload))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Create the signature part
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(unsignedToken)
      .sign(privateKey, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Combine all parts
    return `${unsignedToken}.${signature}`;
  }

  private async getAccessToken(clientEmail: string, privateKey: string) {
    try {
      const jwt = this.createJWT(clientEmail, privateKey);

      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        },
      });

      return tokenResponse.data.access_token;
    } catch (error: any) {
      throw new ErrorHandler('google', 'AuthenticationError', `Authentication failed`, error.response.status, error.response.data);
    }
  }
}
