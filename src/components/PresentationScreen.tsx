import { useEffect, useState } from "react";
import { save, message } from "@tauri-apps/plugin-dialog";
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

      // Load all images
      const res = await Promise.all(
        response.config.imgpaths.map((path) => loadImage(path))
      );

      setConfig(response.config);
      setPathForSave(response.dirPath);
      setImages(res);

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

  const imgNames = config?.imgpaths.map((path) => {
    // Extract the filename from path
    const parts = path.split(/[\\/]/); // splits on / or \
    const filename = parts[parts.length - 1];

    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    return nameWithoutExt;
  });

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
        onMainScreen();
      }
    }
  };

  console.log(userResponses);

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
          <div className="flex absolute bottom-8 left-1/2 transform -translate-x-1/2 justify-center w-4/5">
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
                    } // or r if you want the string
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
