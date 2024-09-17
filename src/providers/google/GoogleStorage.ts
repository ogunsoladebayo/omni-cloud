import { IGoogleConfig, IStorageProvider } from '../../';
import * as crypto from 'node:crypto';
import axios from 'axios';
import { readFile } from 'fs/promises';
import * as fs from 'node:fs';
import { ErrorHandler } from '../../utils/ErrorHandler';

export class GoogleStorage implements IStorageProvider {
  private config: IGoogleConfig;

  constructor (config: IGoogleConfig) {
    this.config = config;
  }

  async uploadFile (localPath: string, remotePath: string): Promise<any> {
    const fileContent = await readFile(localPath);
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${ this.config.bucketName }/o?uploadType=media&name=${ remotePath }`;
    const token = await this.getAccessToken(this.config.credentials.client_email, this.config.credentials.private_key);

    const headers = {
      Authorization: `Bearer ${ token }`,
      'Content-Type': 'application/octet-stream',
    };

    const response = await axios.post(url, fileContent, { headers });
    if (response.status !== 200) {
      throw new ErrorHandler('GoogleStorage', `Failed to upload file: ${ response.data }`);
    } else {
      return response.data;
    }
  }

  async downloadFile (remotePath: string, localPath: string): Promise<void> {
    const url = `https://storage.googleapis.com/storage/v1/b/${ this.config.bucketName }/o/${ encodeURIComponent(remotePath) }?alt=media`;
    const token = await this.getAccessToken(this.config.credentials.client_email, this.config.credentials.private_key);

    const headers = {
      Authorization: `Bearer ${ token }`,
    };

    const response = await axios.get(url, { headers, responseType: 'stream' });
    if (response.status !== 200) {
      throw new ErrorHandler('NetwrokError',`Failed to download file`, response.status, response.data);
    }
    const writer = fs.createWriteStream(localPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async deleteFile (filePath: string): Promise<void> {
    const url = `https://storage.googleapis.com/storage/v1/b/${ this.config.bucketName }/o/${ encodeURIComponent(filePath) }`;
    const token = await this.getAccessToken(this.config.credentials.client_email, this.config.credentials.private_key);

    const headers = {
      Authorization: `Bearer ${ token }`,
    };

    const response = await axios.delete(url, { headers });
    if (response.status !== 204) {
      throw new ErrorHandler('NetworkError', `Failed to delete file`, response.status, response.data);
    } else {
      return response.data;
    }
  }

  private createJWT (clientEmail: string, privateKey: string) {
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
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Create the signature part
    const unsignedToken = `${ encodedHeader }.${ encodedPayload }`;
    const signature = crypto.createSign('RSA-SHA256').update(unsignedToken).sign(privateKey, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Combine all parts
    return `${ unsignedToken }.${ signature }`;
  };

  private async getAccessToken (clientEmail: string, privateKey: string) {
    const jwt = this.createJWT(clientEmail, privateKey);

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      },
    });

    return tokenResponse.data.access_token;
  };

}
