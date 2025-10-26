interface MainScreenProps {
  onNewConfig: () => void;
}

const MainScreen = ({ onNewConfig }: MainScreenProps) => {
  const buttonStyle =
    "px-8 py-1 border-1 rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer";

  return (
    <div className="flex flex-col w-dvw h-dvh justify-center items-center gap-8">
      <h1 className="text-2xl font-medium">Welcome to EvalEmo 2.0</h1>
      <div className="flex w-1/2 gap-4 justify-center">
        <button className={buttonStyle} onClick={onNewConfig}>
          New Config
        </button>
        <button className={buttonStyle}>Load Config</button>
      </div>
    </div>
  );
};

export default MainScreen;
