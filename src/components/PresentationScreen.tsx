import { useEffect, useState } from "react";
import { save, message, confirm } from "@tauri-apps/plugin-dialog";
import Loader from "./utils/Loader";
import {
  loadConfig,
  loadImage,
  saveData,
  type ConfigData,
  type UserResponses,
} from "./utils/ConfigManager";

interface PresentationScreenProps {
  onMainScreen: () => void;
  setSavePath: (path: string) => void;
  savePath: string;
}

const PresentationScreen = ({
  onMainScreen,
  setSavePath,
  savePath,
}: PresentationScreenProps) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [pathForSave, setPathForSave] = useState<string | null>(savePath);
  const [images, setImages] = useState<string[]>([]);
  const [imgNames, setImgNames] = useState<string[]>([]);
  const [imgIdx, setImgIdx] = useState<number>(0);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<UserResponses[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      const response = await loadConfig(savePath);

      if (!response) {
        alert("No config selected or invalid file");
        onMainScreen();
        return;
      }

      const paths = response.config.imgpaths;
      let shuffledPaths = paths;

      if (response.config.rand) {
        // shuffle paths
        const indices = Array.from({ length: paths.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        shuffledPaths = indices.map((i) => paths[i]);
      }

      // load images as base64
      const loadedImages = await Promise.all(
        shuffledPaths.map((p) => loadImage(p))
      );

      // extract names from shuffled paths
      const names = shuffledPaths.map((path) => {
        const parts = path.split(/[\\/]/);
        const filename = parts[parts.length - 1];
        return filename.replace(/\.[^/.]+$/, "");
      });

      setImages(loadedImages);
      setImgNames(names);
      setConfig(response.config);

      // Prompt user for a string (e.g., a session name)
      const path = await save({
        filters: [{ name: "StimEval save", extensions: ["csv"] }],
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

  const handleResponseClick = async (groupName: string, val: string) => {
    if (!config) return;

    const imgName = imgNames ? imgNames[imgIdx] : "";
    const newVal = String(Number(val) + 1); // adjust idx cuz JS

    // Compute the new state first
    const newUserResponses = (() => {
      const existing = userResponses.find((p) => p.image === imgName);

      if (existing) {
        return userResponses.map((p) =>
          p.image === imgName
            ? { ...p, res: [...p.res, { name: groupName, val: newVal }] }
            : p
        );
      } else {
        return [
          ...userResponses,
          { image: imgName, res: [{ name: groupName, val: newVal }] },
        ];
      }
    })();

    // Update state
    setUserResponses(newUserResponses);

    // move to next group
    const nextGroup = currentGroupIndex + 1;

    if (nextGroup < config.responses.length) {
      setCurrentGroupIndex(nextGroup);
    } else {
      // finished all groups for this image
      const nextImg = imgIdx + 1;
      if (nextImg < config.imgpaths.length) {
        setImgIdx(nextImg);
        setCurrentGroupIndex(0);
      } else {
        // finished all images, save results
        await saveData(pathForSave, newUserResponses);
        setSavePath("");
        onMainScreen();
      }
    }
  };

  // Listen for esc to abort experiment
  const handleExit = async (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    const doExit = await confirm(
      "Experiment will abort and data will be lost. Are you sure?",
      { title: "Close Experiment", kind: "warning" }
    );

    if (doExit) {
      setSavePath("");
      onMainScreen();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleExit);
    return () => {
      window.removeEventListener("keydown", handleExit);
    };
  }, []);

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
          <div className="flex flex-col absolute bottom-8 left-1/2 transform -translate-x-1/2 justify-center w-9/10 gap-8">
            <div className="flex w-full justify-center text-2xl font-semibold">
              {config?.responses[currentGroupIndex].name}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 w-full justify-items-center">
              {config &&
                imgIdx < config.imgpaths.length &&
                config.responses[currentGroupIndex].res.map((r, i) => (
                  <button
                    key={i}
                    className={buttonStyle}
                    onClick={() =>
                      handleResponseClick(
                        config.responses[currentGroupIndex].name,
                        String(i)
                      )
                    }
                  >
                    {r}
                  </button>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default PresentationScreen;
