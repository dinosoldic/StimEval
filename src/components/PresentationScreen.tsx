import { useEffect, useState } from "react";
import Loader from "./utils/Loader";
import { loadConfig, loadImage, type ConfigData } from "./utils/ConfigManager";

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
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      const response = {
        bgcolor: "#ffffff",
        imgw: 500,
        imgh: 500,
        nres: 3,
        res: ["a", "A", "A"],
        imgpaths: [
          "C:\\Users\\Dino\\Pictures\\Screenshots\\Screenshot 2025-10-25 003641.png",
          "C:\\Users\\Dino\\Pictures\\Screenshots\\Screenshot 2025-10-24 211143.png",
          "C:\\Users\\Dino\\Pictures\\Screenshots\\Screenshot 2025-10-15 121010.png",
          "C:\\Users\\Dino\\Pictures\\Screenshots\\Screenshot 2025-10-04 004224.png",
          "C:\\Users\\Dino\\Pictures\\Screenshots\\Screenshot 2025-10-03 231046.png",
        ],
      };
      // await loadConfig(savePath);

      // if (response === null) {
      //   alert("No config selected or invalid file");
      //   onMainScreen();
      //   return;
      // }

      // Load images
      const res = await loadImage(response.imgpaths[0]);

      console.log(res);

      setConfig(response);
      setIsLoaded(true);
    };

    fetchConfig();
  }, [savePath]);

  return (
    <>
      {isLoaded ? (
        <div
          className="flex flex-col justify-center items-center"
          style={{
            backgroundColor: config?.bgcolor,
            width: "100dvw",
            height: "100dvh",
          }}
        >
          <div
            className="flex"
            style={{ width: config?.imgw, height: config?.imgh }}
          >
            <img src={images[0]} />
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default PresentationScreen;
