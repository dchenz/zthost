import { useMediaQuery, useToast } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
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

export const createImageThumbnail = (
  file: File,
  thumbnailSize: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = thumbnailSize;
      canvas.height = thumbnailSize;
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
          thumbnailSize,
          thumbnailSize
        );
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject("empty canvas");
        }
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
