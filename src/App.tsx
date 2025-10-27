import { useEffect, useState } from "react";
import { ConfigScreen, MainScreen, PresentationScreen } from "./components";

const App = () => {
  const [screen, setScreen] = useState<"main" | "config" | "presentation">(
    "main"
  );
  const [savePath, setSavePath] = useState<string>(""); // TO pass path from config to session

  useEffect(() => {
    if (screen !== "main") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ""; // Required for all browsers to trigger the confirmation dialog
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [screen]);

  return (
    <>
      {screen === "main" && (
        <MainScreen
          onNewConfig={() => setScreen("config")}
          onLoadConfig={() => setScreen("presentation")}
        />
      )}

      {screen === "config" && (
        <ConfigScreen
          onMainScreen={() => setScreen("main")}
          onPresentationScreen={() => setScreen("presentation")}
          setSavePath={setSavePath}
        />
      )}
      {screen === "presentation" && (
        <PresentationScreen
          onMainScreen={() => setScreen("main")}
          savePath={savePath}
        />
      )}
    </>
  );
};

export default App;
