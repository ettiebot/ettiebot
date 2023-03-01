import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const credentials = readFileSync(
  join('config', process.env.NODE_ENV, 'gc.credentials.json'),
  'utf8',
);
const storage = new Storage({
  credentials: JSON.parse(credentials),
});

export async function uploadFile(
  bucketName: string,
  buffer: Buffer,
  format = 'oga',
) {
  const fileName = `${randomUUID()}.${format}`;
  // Create a reference to a file object
  const file = storage.bucket(bucketName).file(fileName);
  // Upload file
  await file.save(buffer);
  // Return file name
  return fileName;
}

export async function deleteFile(bucketName: string, fileName: string) {
  // Create a reference to a file object
  const file = storage.bucket(bucketName).file(fileName);
  // Delete file
  await file.delete();
}
