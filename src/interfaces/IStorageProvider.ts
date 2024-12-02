import { Stream } from 'node:stream';
import { ReadStream } from 'node:fs';

export interface IStorageProvider {
  /**
   * Uploads a file to the remote storage provider.
   * @param source - The source to the file to be uploaded.
   * @param remotePath - The destination path in the remote storage.
   * @returns A promise that resolves with the result of the upload operation.
   */
  uploadFile(source: string | Buffer | ReadStream, remotePath: string): Promise<any>;

  /**
   * Downloads a file from the remote storage provider as a buffer.
   * @param remotePath - The path of the file in the remote storage.
   * @param options - Additional options for the download operation.
   * @returns A promise that resolves with the downloaded file.
   */
  downloadFile(remotePath: string, options?: { type: 'buffer' } & IDownloadOptions): Promise<Buffer>;

  /**
   * Downloads a file from the remote storage provider as a stream.
   * @param remotePath - The path of the file in the remote storage.
   * @param options - Additional options for the download operation.
   * @returns A promise that resolves with the downloaded file.
   */
  downloadFile(remotePath: string, options?: { type: 'stream' } & IDownloadOptions): Promise<Stream>;
  /**
   * Downloads a file from the remote storage provider and saves it to a destination.
   * @param remotePath - The path of the file in the remote storage.
   * @param destination - The destination where the file will be saved.
   * @param options - Additional options for the download operation.
   * @returns A promise that resolves when the download operation is complete.
   */
  downloadFile(remotePath: string, destination: string, options?: Omit<IDownloadOptions, 'type'>): Promise<void>;

  /**
   * Deletes a file from the remote storage provider.
   * @param filePath - The path of the file to be deleted in the remote storage.
   * @returns A promise that resolves when the delete operation is complete.
   */
  deleteFile(filePath: string): Promise<void>;
}

export interface IDownloadOptions {
  /**
   * The type of response data to expect.
   * @default 'stream'
   */
  type?: 'stream' | 'buffer';
}
