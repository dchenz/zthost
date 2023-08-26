import type { BlobStorage } from "./model";

type PutBlobResponse = {
  id: string;
  kind: string;
  mimeType: string;
  name: string;
};

export class GoogleDriveStorage implements BlobStorage {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getBlob(id: string): Promise<Blob> {
    const xhr = new XMLHttpRequest();
    const response = await new Promise<Blob>((resolve) => {
      xhr.addEventListener("loadend", () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.response);
          }
        }
      });
      xhr.open(
        "GET",
        `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
        true
      );
      xhr.responseType = "blob";
      xhr.setRequestHeader("authorization", `Bearer ${this.accessToken}`);
      xhr.send();
    });
    return response;
  }

  async putBlob(
    blob: Blob,
    onProgress: (loaded: number, total: number) => void
  ): Promise<string> {
    const xhr = new XMLHttpRequest();
    const response = await new Promise<PutBlobResponse>((resolve) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
      xhr.addEventListener("loadend", () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.response);
          }
        }
      });
      xhr.open(
        "POST",
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
        true
      );
      xhr.responseType = "json";
      xhr.setRequestHeader("authorization", `Bearer ${this.accessToken}`);
      xhr.setRequestHeader("content-type", "application/octet-stream");
      xhr.send(blob);
    });
    return response.id;
  }
}
