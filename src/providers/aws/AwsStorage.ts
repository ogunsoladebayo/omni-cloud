import { IStorageProvider } from '../../interfaces/IStorageProvider';
import { IAwsConfig } from '../../interfaces/IAwsConfig';
import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import axios from 'axios';

const readFile = promisify(fs.readFile);

export class AwsStorage implements IStorageProvider {
  private config: IAwsConfig;

  constructor (config: IAwsConfig) {
    this.config = config;
  }

  async deleteFile (filePath: string): Promise<void> {
    const url = this.getSignedUrl('DELETE', filePath);

    await axios.delete(url);
  }

  async downloadFile (remotePath: string, localPath: string): Promise<void> {
    const url = this.getSignedUrl('GET', remotePath);

    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(localPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async listFiles (directoryPath: string): Promise<string[]> {
    const url = this.getSignedUrl('GET', `${ directoryPath }?list-type=2`);

    const response = await axios.get(url);
    const result = response.data.match(/<Key>(.*?)<\/Key>/g);
    return result ? result.map((key: string) => key.replace(/<\/?Key>/g, '')) : [];
  }

  async uploadFile (localPath: string, remotePath: string): Promise<any> {
    const fileContent = await readFile(localPath);
    const url = this.getSignedUrl('PUT', remotePath);

    await axios.put(url, fileContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

  }

  private getSignature (key: string, dateStamp: string, regionName: string, serviceName: string): string {
    const kDate = crypto.createHmac('sha256', 'AWS4' + this.config.secretAccessKey).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return crypto.createHmac('sha256', kSigning).update(key).digest('hex');
  }

  private getSignedUrl (method: string, key: string): string {
    const host = `${ this.config.bucketName }.s3.${ this.config.region }.amazonaws.com`;
    const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = datetime.substring(0, 8);
    const credentialScope = `${ date }/${ this.config.region }/s3/aws4_request`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      method,
      `/${ key }`,
      '',
      `host:${ host }`,
      'x-amz-content-sha256:UNSIGNED-PAYLOAD',
      `x-amz-date:${ datetime }`,
      '',
      signedHeaders,
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      datetime,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const signature = this.getSignature(stringToSign, date, this.config.region, 's3');

    return `https://${ host }/${ key }?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${ this.config.accessKeyId }%2F${ credentialScope }&X-Amz-Date=${ datetime }&X-Amz-Expires=86400&X-Amz-SignedHeaders=${ signedHeaders }&X-Amz-Signature=${ signature }`;
  }
}
