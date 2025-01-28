import { describe, expect, test, mock } from 'bun:test';
import { ProviderFactory } from '../../src/providers/ProviderFactory';

describe("uploadFile", () => {
  const provider = (ProviderFactory.createProvider({
          provider: 'aws',
      aws: {
        bucketName: 'bucket',
        region: 'region',
        credentials: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
        },
      },
  }))

  test("should upload a file successfully", async () => {
    const mockUpload = mock(provider.uploadFile);
    const result = await mockUpload("local/path/to/file.txt", "remote/path");
    expect(result).toBeUndefined();
    expect(mockUpload).toHaveBeenCalledWith(
      "local/path/to/file.txt",
      "remote/path"
    );
  });

  test("should throw an error when the file does not exist", async () => {
    const mockUpload = mock(provider.uploadFile);
    expect(mockUpload('non/existent/file.txt', 'remote/path')).rejects.toThrow();
    expect(mockUpload).toHaveBeenCalledWith(
      "non/existent/file.txt",
      "remote/path"
    );
  });

  test("should throw an error when the file is empty", async () => {
    const mockUpload = mock(provider.uploadFile);
    expect(mockUpload('', 'remote/path')).rejects.toThrow();
    expect(mockUpload).toHaveBeenCalledWith(
      "",
      "remote/path"
    );
  });
});
