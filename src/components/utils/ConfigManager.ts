// src/utils/configManager.ts
import { open } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path";
import {
  readTextFile,
  create,
  readFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

export interface ConfigData {
  bgcolor: string;
  imgw: number;
  imgh: number;
  nres: number;
  responses: {
    name: string;
    n: number;
    res: string[];
  }[];
  mediapaths: string[];
  mediatypes: string[];
  rand: boolean;
}

export interface UserResponses {
  image: string;
  res: { name: string; val: string }[];
}

// MIME resolver
function getMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    // Images
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";

    // Videos
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";

    // Audio
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "m4a":
      return "audio/mp4";

    default:
      return "application/octet-stream";
  }
}

export async function saveConfig(data: ConfigData, savepath: string) {
  // Ensure filename ends with -stimeval.config.json
  if (!savepath.endsWith("-stimeval.config.json")) {
    savepath = savepath.replace(/\.json$/, "") + "-stimeval.config.json";
  }

  const file = await create(savepath);
  await file.write(new TextEncoder().encode(JSON.stringify(data, null, 2)));
  await file.close();
}

export async function loadConfig(
  path: string
): Promise<{ config: ConfigData; dirPath: string } | null> {
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
  const config = JSON.parse(text) as ConfigData;

  // Get directory path
  const dirPath = await dirname(path);

  return { config, dirPath };
}

export async function loadMedia(path: string) {
  // Read file as bytes
  const bytes = await readFile(path);

  // Convert bytes to base64
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64String = btoa(binary);

  // Detect MIME type based on extension
  const mimeType = getMimeType(path);

  return `data:${mimeType};base64,${base64String}`;
}

export async function saveData(
  savePath: string | null,
  userRes: UserResponses[]
) {
  if (!savePath) {
    return;
  }

  // Build row-wise CSV
  const csvRows = [["Media Name", ...userRes[0].res.map((r) => r.name)]];
  userRes.forEach((imgRes) => {
    csvRows.push([imgRes.image, ...imgRes.res.map((r) => r.val)]);
  });

  const csvContent = csvRows.map((row) => row.join(",")).join("\n");

  await writeTextFile(savePath, csvContent);
}
