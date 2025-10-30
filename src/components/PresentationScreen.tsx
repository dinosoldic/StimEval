import { useEffect, useState } from "react";
import { save, message } from "@tauri-apps/plugin-dialog";
import Loader from "./utils/Loader";
import {
  loadConfig,
  loadImage,
  saveData,
  type ConfigData,
} from "./utils/ConfigManager";

interface PresentationScreenProps {
  onMainScreen: () => void;
  savePath: string;
}

const PresentationScreen = ({
  onMainScreen,
  savePath,
}: PresentationScreenProps) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [pathForSave, setPathForSave] = useState<string | null>(savePath);
  const [images, setImages] = useState<string[]>([]);
  const [isValSet, setIsValSet] = useState<boolean>(true);
  const [isAroSet, setIsAroSet] = useState<boolean>(false);
  const [valRes, setValRes] = useState<string[]>([]);
  const [aroRes, setAroRes] = useState<string[]>([]);
  const [imgIdx, setImgIdx] = useState<number>(0);

  useEffect(() => {
    const fetchConfig = async () => {
      const response = await loadConfig(savePath);

      if (!response) {
        alert("No config selected or invalid file");
        onMainScreen();
        return;
      }

      // Load all images
      const res = await Promise.all(
        response.config.imgpaths.map((path) => loadImage(path))
      );

      setConfig(response.config);
      setPathForSave(response.dirPath);
      setImages(res);

      // Prompt user for a string (e.g., a session name)
      const path = await save({
        filters: [{ name: "evalemo 2.0 save", extensions: ["csv"] }],
      });

      if (!path)
        await message("Results will not be saved", {
          title: "Save canceled",
          kind: "warning",
        });

      setPathForSave(path);

      setIsLoaded(true);
    };

    fetchConfig();
  }, [savePath]);

  const imgNames = config?.imgpaths.map((path) => {
    // Extract the filename from path
    const parts = path.split(/[\\/]/); // splits on / or \
    const filename = parts[parts.length - 1];

    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    return nameWithoutExt;
  });

  const handleValClick = (val: string) => {
    setValRes([...valRes, val]);
    setIsValSet(false);
    setIsAroSet(true);
  };

  const handleAroClick = async (val: string) => {
    if (!config) return;

    const updatedAro = [...aroRes, val];
    setAroRes(updatedAro);

    const nextIdx = imgIdx + 1; // calculate next image
    setImgIdx(nextIdx);

    if (nextIdx < config.imgpaths.length) {
      setIsValSet(true);
      setIsAroSet(false);
    } else {
      setIsValSet(false);
      setIsAroSet(false);
      await saveData(pathForSave, imgNames, valRes, updatedAro);
      onMainScreen();
    }
  };

  // styles
  const buttonStyle =
    "w-50 px-8 py-1 border rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer";

  return (
    <>
      {isLoaded ? (
        <div
          className="relative w-screen h-screen overflow-clip"
          style={{
            backgroundColor: config?.bgcolor,
            width: "100dvw",
            height: "100dvh",
          }}
        >
          {config && imgIdx < config.imgpaths.length ? (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ width: config?.imgw, height: config?.imgh }}
            >
              <img className="size-full object-contain" src={images[imgIdx]} />
            </div>
          ) : (
            <Loader />
          )}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 justify-center w-full max-w-8/10">
            {config &&
              isValSet &&
              Array.from({ length: config?.nresval ?? 0 }).map((_, i) => (
                <button
                  className={buttonStyle}
                  key={i}
                  onClick={() => handleValClick(config.resval[i])}
                  disabled={!isValSet}
                >
                  {config.resval[i]}
                </button>
              ))}

            {config &&
              isAroSet &&
              Array.from({ length: config?.nresaro ?? 0 }).map((_, i) => (
                <button
                  className={buttonStyle}
                  key={i}
                  onClick={() => handleAroClick(config.resaro[i])}
                  disabled={!isAroSet}
                >
                  {config.resaro[i]}
                </button>
              ))}
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default PresentationScreen;
