export interface UploadFileInput {
  buffer: Buffer;
  key: string;
  contentType: string;
  contentLength?: number;
}

export interface UploadFileResult {
  key: string;
  url: string;
}
