import { ReadStream } from 'node:fs';

export async function streamToBuffer (stream: ReadStream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
