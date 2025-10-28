// src/utils/configManager.ts
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, create, readFile } from "@tauri-apps/plugin-fs";

export interface ConfigData {
  bgcolor: string;
  imgw: number;
  imgh: number;
  nres: number;
  res: string[];
  imgpaths: string[];
}

function getMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    case "tif":
    case "tiff":
      return "image/tiff";
    case "avif":
      return "image/avif";
    case "heic":
      return "image/heic";
    default:
      return "application/octet-stream"; // fallback
  }
}

export async function saveConfig(data: ConfigData, savepath: string) {
  console.log(data);

  const file = await create(savepath);
  await file.write(new TextEncoder().encode(JSON.stringify(data, null, 2)));
  await file.close();
}

export async function loadConfig(path: string): Promise<ConfigData | null> {
  if (path === "") {
    const selected = await open({
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!selected || typeof selected !== "string") {
      return null;
    }

    path = selected;
  }

  const text = await readTextFile(path);
  return JSON.parse(text) as ConfigData;
}

export async function loadImage(path: string) {
  const bytes = await readFile(path);
  return bytes;
}
