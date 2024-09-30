import { IAwsConfig, IStorageProvider } from '../..';
import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import axios from 'axios';
import { ErrorHandler } from '../../utils/ErrorHandler';

const readFile = promisify(fs.readFile);

interface RequestConfig {
  url: string;
  config: {
    headers: {
      'host': string;
      'x-amz-date': string;
      'x-amz-content-sha256'?: string;
      'Authorization': string;
      'Content-Type': string;
    };
  };
}

export class AwsStorage implements IStorageProvider {
  private config: IAwsConfig;

  constructor (config: IAwsConfig) {
    this.config = config;
  }

  async deleteFile (filePath: string): Promise<void> {
    try {
      const host = this.getHost();
      const config = this.getRequestConfig('DELETE', host, filePath);
  
      await axios.delete(config.url, config.config);
    } catch (error: any) {
      throw new ErrorHandler('aws', 'NetworkError', 'Failed to delete file', error.response.status, error.response.data);
    }
  }

  async downloadFile (remotePath: string, localPath: string): Promise<void> {
    try {
      const host = this.getHost();
      const config = this.getRequestConfig('GET', host, remotePath);
  
      const response = await axios.get(config.url, { ...config.config, responseType: 'stream' });
      const writer = fs.createWriteStream(localPath);
  
      response.data.pipe(writer);
  
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', (err: any) => reject(
          new ErrorHandler('aws', 'NetworkError', 'Failed to download file', err.response.status, err.response.data)
        ));
      });
    } catch (error: any) {
      throw new ErrorHandler('aws', 'NetworkError', 'Failed to fetch/download file', error.response.status, error.response.data);     
    }
  }

  async uploadFile (localPath: string, remotePath: string): Promise<any> {
    try {
      const host = this.getHost();
      const fileContent = await readFile(localPath);
      const config = this.getRequestConfig('PUT', host, remotePath, fileContent);
      const newConfig = { ...config.config, headers: { ...config.config.headers, 'Content-Type': 'application/octet-stream' } };
      await axios.put(config.url, fileContent, newConfig);
    } catch (error: any) {
      throw new ErrorHandler('aws', 'NetworkError', 'Failed to upload file', error.response.status, error.response.data)  
    }
  }

  // Create a datetime object for signing
  private getAmzDate (): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${ year }${ month }${ day }T${ hours }${ minutes }${ seconds }Z`;
  }

  private getSigningKey (dateStamp: string): Buffer {
    const secretAccessKey = this.config.credentials.secretAccessKey;
    const region = this.config.region;
    const kDate = crypto.createHmac('SHA256', `AWS4${ secretAccessKey }`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('SHA256', kDate).update(region).digest();
    const kService = crypto.createHmac('SHA256', kRegion).update('s3').digest();
    return crypto.createHmac('SHA256', kService).update('aws4_request').digest();
  }

  private getHost (): string {
    return `${ this.config.bucketName }.s3.amazonaws.com`;
  }

  private generateCanonicalRequestHash (method: string, host: string, path: string, payloadHash: string, dateStamp: string): string {
    const canonicalQuerystring = '';
    const canonicalHeaders = `host:${ host }\nx-amz-content-sha256:${ payloadHash }\nx-amz-date:${ dateStamp }\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `${ method }\n${ path }\n${ canonicalQuerystring }\n${ canonicalHeaders }\n${ signedHeaders }\n${ payloadHash }`;
    return crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  }

  private getSignature (signingKey: Buffer, stringToSign: string): string {
    return crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  }

  private getRequestConfig (method: string, host: string, path: string, payload?: Buffer): RequestConfig {
    try {
          const amzDate = this.getAmzDate();
          const dateStamp = amzDate.slice(0, 8);
      
          const algorithm = 'AWS4-HMAC-SHA256';
          const accessKey = this.config.credentials.accessKeyId;
          const signingKey = this.getSigningKey(dateStamp);
          const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
      
          const credentialScope = `${ dateStamp }/${ this.config.region }/s3/aws4_request`;
          const payloadHash = payload ? crypto.createHash('sha256').update(payload).digest('hex') : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // SHA-256 hash of an empty string
      
          const canonicalRequestHash = this.generateCanonicalRequestHash(method, host, path, payloadHash, amzDate);
          const stringToSign = `${ algorithm }\n${ amzDate }\n${ credentialScope }\n${ canonicalRequestHash }`;
      
          const signature = this.getSignature(signingKey, stringToSign);
          const authorizationHeader = `${ algorithm } Credential=${ accessKey }/${ credentialScope }, SignedHeaders=${ signedHeaders }, Signature=${ signature }`;
          return {
            url: `https://${ host }${ path }`,
            config: {
              headers: {
                'Authorization': authorizationHeader,
                'Content-Type': 'text/plain',
                'x-amz-date': amzDate,
                'x-amz-content-sha256': payloadHash,
                'host': host,
              },
            },
          };
    } catch (error: any) {
      throw new ErrorHandler('aws', 'NetworkError', 'Failed to get request config', error.response.status, error.response.data);
      
    }
  }
}
