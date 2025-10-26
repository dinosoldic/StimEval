import { useEffect, useState } from "react";
import { ConfigScreen, MainScreen } from "./components";

const App = () => {
  const [screen, setScreen] = useState<"main" | "config" | "presentation">(
    "main"
  );

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
        <MainScreen onNewConfig={() => setScreen("config")} />
      )}

      {screen === "config" && (
        <ConfigScreen onMainScreen={() => setScreen("main")} />
      )}
      {/* {screen === "presentation" && <PresentationScreen />} */}
    </>
  );
};

export default App;
