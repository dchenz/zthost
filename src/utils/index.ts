import { useMediaQuery, useToast } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { THUMBNAIL_SIZE } from "../config";
import type { Folder, FolderEntry } from "../database/model";
import type { ToastId, UseToastOptions } from "@chakra-ui/react";

export const useMobileView = () => {
  const [isMobileView] = useMediaQuery("(max-width: 600px)");

  return isMobileView;
};

export function usePersistentState<T>(
  name: string,
  defaultValue: T
): [T, (value: T) => void] {
  const storedState = useMemo(() => {
    const value = localStorage.getItem(name);
    if (value === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }, [name, defaultValue]);

  const [state, setState] = useState<T>(storedState);

  const setNewState = useCallback(
    (newState: T) => {
      localStorage.setItem(name, JSON.stringify(newState));
      setState(newState);
    },
    [name, setState]
  );

  return [state, setNewState];
}

export function formatBinarySize(n: number): string {
  if (n < 1024) {
    return `${n.toFixed(2)} B`;
  }
  n /= 1024;
  if (n < 1024) {
    return `${n.toFixed(2)} KB`;
  }
  n /= 1024;
  if (n < 1024) {
    return `${n.toFixed(2)} MB`;
  }
  n /= 1024;
  return `${n.toFixed(2)} GB`;
}

export function formatRelativeTime(date: Date): string {
  let n = (Date.now() - date.getTime()) / 1000;
  if (n < 60) {
    return "Just now";
  }
  n /= 60;
  if (n < 60) {
    return `${Math.floor(n)}min ago`;
  }
  n /= 60;
  if (n < 24) {
    return `${Math.floor(n)}hr ago`;
  }
  return date.toLocaleString();
}

export const createImageThumbnail = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = THUMBNAIL_SIZE;
      canvas.height = THUMBNAIL_SIZE;
      canvas
        .getContext("2d")
        ?.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          THUMBNAIL_SIZE,
          THUMBNAIL_SIZE
        );
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject("empty canvas");
        }
        canvas.remove();
      }, file.type);
    };
    blobToDataUri(file).then((dataUri) => {
      img.src = dataUri;
    });
  });
};

export const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
};

export const useChakraToast = () => {
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const openToast = useCallback(
    (options: UseToastOptions) => {
      if (toastRef.current) {
        toast.close(toastRef.current);
      }
      toastRef.current = toast(options);
    },
    [toast, toastRef.current]
  );

  const updateToast = useCallback(
    (options: Omit<UseToastOptions, "id">) => {
      if (toastRef.current) {
        toast.update(toastRef.current, options);
      }
    },
    [toast, toastRef.current]
  );

  const closeToast = useCallback(() => {
    if (toastRef.current) {
      toast.close(toastRef.current);
    }
  }, [toast, toastRef.current]);

  return {
    openToast,
    updateToast,
    closeToast,
  };
};

export const isImage = (mimetype: string) => {
  return mimetype.startsWith("image/");
};

export const isVideo = (mimetype: string) => {
  return mimetype.startsWith("video/");
};

// Returns true, if the path is recursively inside or equal to the folder.
export const folderContains = (folder: Folder, path: FolderEntry[]) => {
  // The folder must appear somewhere in the path,
  // if it refers to the folder itself or something inside.
  for (const item of path) {
    if (item.id === folder.id) {
      return true;
    }
  }
  return false;
};

export const createVideoThumbnail = (file: File): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");
    const source = document.createElement("source");
    const urlRef = URL.createObjectURL(file);
    source.setAttribute("src", urlRef);
    video.setAttribute("preload", "metadata");
    video.appendChild(source);
    document.body.appendChild(canvas);
    document.body.appendChild(video);
    video.currentTime = 0.5;
    video.load();

    video.addEventListener("loadedmetadata", () => {
      canvas.width = THUMBNAIL_SIZE;
      canvas.height = THUMBNAIL_SIZE;
    });

    video.addEventListener("loadeddata", () => {
      setTimeout(() => {
        canvas
          .getContext("2d")
          ?.drawImage(video, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject("empty canvas");
          }
          URL.revokeObjectURL(urlRef);
          video.remove();
          canvas.remove();
        }, "image/png");
      }, 2000);
    });
  });
};

export const generateThumbnail = async (file: File): Promise<Blob | null> => {
  if (isImage(file.type)) {
    return await createImageThumbnail(file);
  }
  if (isVideo(file.type)) {
    return await createVideoThumbnail(file);
  }
  return null;
};
