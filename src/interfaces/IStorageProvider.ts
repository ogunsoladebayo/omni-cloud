export interface IStorageProvider {
  /**
   * Uploads a file to the remote storage provider.
   * @param localPath - The local path to the file to be uploaded.
   * @param remotePath - The destination path in the remote storage.
   * @returns A promise that resolves with the result of the upload operation.
   */
  uploadFile(localPath: string, remotePath: string): Promise<any>;

  /**
   * Downloads a file from the remote storage provider.
   * @param remotePath - The path of the file in the remote storage.
   * @param localPath - The local path where the file will be saved.
   * @returns A promise that resolves when the download operation is complete.
   */
  downloadFile(remotePath: string, localPath: string): Promise<void>;

  /**
   * Deletes a file from the remote storage provider.
   * @param filePath - The path of the file to be deleted in the remote storage.
   * @returns A promise that resolves when the delete operation is complete.
   */
  deleteFile(filePath: string): Promise<void>;
}
