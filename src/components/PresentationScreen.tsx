import { useEffect, useState } from "react";
import Loader from "./utils/Loader";
import { loadConfig } from "./utils/ConfigManager";

interface PresentationScreenProps {
  onMainScreen: () => void;
  savePath: string;
}

const PresentationScreen = ({
  onMainScreen,
  savePath,
}: PresentationScreenProps) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const response = loadConfig(savePath);
    console.log(response);

    if (response === null) {
      onMainScreen();
      alert("a");
    }
  }, []);

  return (
    <>
      {isLoaded ? (
        <div>
          PresentationScreen
          <div>PresentationScreen content here</div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default PresentationScreen;
