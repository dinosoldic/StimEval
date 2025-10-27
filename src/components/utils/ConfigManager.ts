// src/utils/configManager.ts
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, create } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

export interface ConfigData {
  bgcolor: string;
  imgw: number;
  imgh: number;
  nres: number;
  res: string[];
  imgpaths: string[];
}

export async function saveConfig(data: ConfigData, savepath: string) {
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
