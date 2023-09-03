import { v4 as uuid } from "uuid";
import { Buffer } from "buffer";
import { firebaseConfig } from "../firebase";
import type { BlobStorage } from "./model";

type PutBlobResponse = {
  id: string;
  kind: string;
  mimeType: string;
  name: string;
};

export class GoogleDriveStorage implements BlobStorage {
  accessToken: string;
  rootFolderId: string;

  constructor(accessToken: string, rootFolderId: string) {
    this.accessToken = accessToken;
    this.rootFolderId = rootFolderId;
  }

  async initialize(): Promise<string> {
    const folderName = `DO NOT DELETE - zthost:${firebaseConfig.projectId}`;
    return this.createFolder(folderName);
  }

  async createFolder(name: string): Promise<string> {
    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
      }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return (await response.json()).id;
  }

  async deleteBlob(id: string): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  async getBlob(
    id: string,
    onProgress: (loaded: number) => void
  ): Promise<ArrayBuffer> {
    const xhr = new XMLHttpRequest();
    const response = await new Promise<Blob>((resolve) => {
      xhr.addEventListener("progress", (event) => {
        onProgress(event.loaded);
      });
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
    return await response.arrayBuffer();
  }

  async putBlob(
    blob: ArrayBuffer,
    onProgress: (loaded: number) => void
  ): Promise<string> {
    const xhr = new XMLHttpRequest();
    const response = await new Promise<PutBlobResponse>((resolve) => {
      xhr.upload.addEventListener("progress", (event) => {
        onProgress(event.loaded);
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
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        true
      );
      const boundary = uuid();
      xhr.responseType = "json";
      xhr.setRequestHeader("authorization", `Bearer ${this.accessToken}`);
      xhr.setRequestHeader(
        "content-type",
        `multipart/related; boundary=${boundary}`
      );
      const body = this.buildMultipartRelatedBody(boundary, blob, {
        parents: [this.rootFolderId],
      });
      xhr.send(body);
    });
    return response.id;
  }

  buildMultipartRelatedBody(
    boundary: string,
    data: ArrayBuffer,
    metadata: object
  ): ArrayBuffer {
    let body = "--" + boundary + "\r\n";
    body += 'Content-Disposition: form-data; name="metadata"\r\n';
    body += "Content-Type: application/json; charset=UTF-8\r\n\r\n";
    body += JSON.stringify(metadata) + "\r\n";
    body += "--" + boundary + "\r\n";
    body += 'Content-Disposition: form-data; name="file"\r\n\r\n';
    return Buffer.concat([
      Buffer.from(body, "utf8"),
      new Uint8Array(data),
      Buffer.from("\r\n--" + boundary + "--\r\n", "utf8"),
    ]);
  }
}
