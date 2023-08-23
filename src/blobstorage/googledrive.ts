import type { BlobStorage } from "./model";

export class GoogleDriveStorage implements BlobStorage {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getBlob(id: string): Promise<Blob> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
      {
        headers: {
          authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.blob();
  }

  async putBlob(blob: Blob): Promise<string> {
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.accessToken}`,
          "content-type": "application/octet-stream",
        },
        body: blob,
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return (await response.json()).id;
  }
}
