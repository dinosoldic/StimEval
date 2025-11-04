import type { MainScreenProps } from "@/types/StimEvalTypes";
import { useEffect } from "react";

const MainScreen = ({
  onNewConfig,
  onLoadConfig,
  setSavePath,
}: MainScreenProps) => {
  // each time main menu is loaded reset path to avoid conflicts
  useEffect(() => {
    setSavePath("");
  }, []);

  // styles
  const buttonStyle =
    "px-8 py-1 border rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer";

  return (
    <div className="flex flex-col w-dvw h-dvh justify-center items-center gap-8">
      <h1 className="text-3xl font-semibold text-center">
        Welcome to StimEval
      </h1>
      <div className="flex justify-center items-center size-28 mb-8 shadow-2xl rounded-4xl">
        <img
          src="assets/icon.png"
          aria-label="StimEval"
          className="size-full object-contain"
        />
      </div>
      <div className="flex w-1/2 gap-4 justify-center">
        <button className={buttonStyle} onClick={onNewConfig}>
          New Config
        </button>
        <button className={buttonStyle} onClick={onLoadConfig}>
          Load Config
        </button>
      </div>
    </div>
  );
};

export default MainScreen;
