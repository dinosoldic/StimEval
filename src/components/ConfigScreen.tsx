import { useEffect, useState } from "react";
import { LeftArrow } from "../constants/svgFiles";
import { open, save } from "@tauri-apps/plugin-dialog";
import { saveConfig } from "./utils/ConfigManager";
import ShowPreview from "./utils/ShowPreview";
import type {
  ConfigData,
  ConfigScreenProps,
  ResponseTypes,
} from "@/types/StimEvalTypes";

const ConfigScreen = ({
  onMainScreen,
  onPresentationScreen,
  setSavePath,
}: ConfigScreenProps) => {
  // init vars
  const defaultResponse: ResponseTypes = {
    name: "",
    n: 1,
    res: Array(1).fill(""),
  }; //default user resp

  const imageExts = ["png", "jpg", "jpeg", "webp"];
  const videoExts = ["mp4", "webm"];
  const audioExts = ["mp3", "wav", "ogg", "m4a"];

  const [bgColor, setBgColor] = useState<string>("#ffffff"); // color
  const [imgW, setImgW] = useState<number>(500); // width of image (px)
  const [imgH, setImgH] = useState<number>(500); // height of image (px)
  const [nRes, setNRes] = useState<number>(1);
  const [responses, setResponses] = useState<ResponseTypes[]>([
    defaultResponse,
  ]); // store user res
  const [mediaPaths, setMediaPaths] = useState<string[]>([]); // store loaded imgs
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [randomize, setRandomize] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [canSave, setCanSave] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [savedConfig, setSavedConfig] = useState<ConfigData | null>(null);

  //// handle change
  // temporary string state for controlled input
  const [imgWInput, setImgWInput] = useState(imgW.toString());
  const [imgHInput, setImgHInput] = useState(imgH.toString());
  const [nResInput, setNResInput] = useState(nRes.toString());

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImgWInput(val); // allow typing freely
    const num = Number(val);
    if (!isNaN(num)) setImgW(num); // update numeric state only if valid
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImgHInput(val);
    const num = Number(val);
    if (!isNaN(num)) setImgH(num);
  };

  const selectFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Media",
          extensions: [...imageExts, ...videoExts, ...audioExts],
        },
      ],
    });
    if (selected) setMediaPaths(selected);
  };

  const handleNResChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNResInput(val);
    const num = Number(val);
    if (isNaN(num) || num < 1) return;
    setNRes(num);

    // resize responses array dynamically
    setResponses((prev) => {
      const diff = num - prev.length;
      if (diff > 0) {
        // Add missing groups using defaultResponse
        return [
          ...prev,
          ...Array.from({ length: diff }, () => ({ ...defaultResponse })),
        ];
      } else if (diff < 0) {
        // Remove extra groups
        return prev.slice(0, num);
      }
      return prev;
    });
  };

  const handleNameChange = (index: number, value: string) => {
    setResponses((prev) => {
      const newArr = [...prev];
      newArr[index].name = value;
      return newArr;
    });
  };

  const handleNChange = (index: number, value: string) => {
    const n = Number(value);
    if (isNaN(n)) return;
    setResponses((prev) => {
      const newArr = [...prev];
      newArr[index].n = n;
      newArr[index].res = Array.from(
        { length: n },
        (_, i) => newArr[index].res[i] || ""
      );
      return newArr;
    });
  };

  const handleResChange = (
    groupIndex: number,
    resIndex: number,
    value: string
  ) => {
    setResponses((prev) => {
      const newArr = [...prev];
      newArr[groupIndex].res[resIndex] = value;
      return newArr;
    });
  };

  // set media type
  const handleMediaTypes = async () => {
    if (!mediaPaths || mediaPaths.length === 0) return;

    const types = mediaPaths.map((path) => {
      const ext = path.split(".").pop()?.toLowerCase() || "";

      if (imageExts.includes(ext)) return "img";
      if (videoExts.includes(ext)) return "vid";
      if (audioExts.includes(ext)) return "aud";
      return "unknown"; // fallback
    });

    setMediaTypes(types);
  };

  useEffect(() => {
    if (mediaPaths.length === 0) return;
    handleMediaTypes();
  }, [mediaPaths]);

  // data validation
  const checkData = async (data: {
    bgcolor: string;
    imgw: number;
    imgh: number;
    nres: number;
    responses: ResponseTypes[];
    mediapaths: string[];
    mediatypes: string[];
  }) => {
    // Check basic fields
    if (
      !data.bgcolor?.trim() ||
      !data.imgw ||
      !data.imgh ||
      !data.nres ||
      !data.mediapaths?.length ||
      !data.mediatypes?.length
    ) {
      alert("All fields must be filled");
      return false;
    }

    const { responses } = data;

    // Ensure at least one response group
    if (!responses || !responses.length) {
      alert("At least one response group is required");
      return false;
    }

    // Validate each group
    const invalidResponseGroup = responses.some((group) => {
      if (!group.name?.trim()) return true;
      if (typeof group.n !== "number" || group.n < 1) return true;
      if (!Array.isArray(group.res) || group.res.length !== group.n)
        return true;
      return group.res.some((r) => !r.trim());
    });

    if (invalidResponseGroup) {
      alert(
        "Each response group must have a name and at least 1 response option"
      );
      return false;
    }

    return true;
  };

  const handlePreview = async () => {
    await handleMediaTypes();

    const data = {
      bgcolor: bgColor,
      imgw: imgW,
      imgh: imgH,
      nres: nRes,
      responses,
      mediapaths: mediaPaths,
      mediatypes: mediaTypes,
      rand: randomize,
    };

    const isValid = await checkData(data);
    if (!isValid) return;

    setSavedConfig(data);
    setIsPreviewVisible(true);
  };

  // submit data
  const handleSave = async () => {
    if (!savedConfig) return;

    const yymmdd = new Date().toISOString().split("T")[0];
    const hhmm = new Date()
      .toISOString()
      .split("T")[1]
      .split(".")[0]
      .split(":")
      .join("-");

    const savepath = await save({
      filters: [{ name: "JSON", extensions: ["json"] }],
      defaultPath: `${yymmdd}-${hhmm}-stimeval.config.json`,
    });

    if (!savepath) return;

    setSavePath(savepath); // for shared state
    await saveConfig(savedConfig, savepath);
    setIsSaved(true);
  };

  const handleRun = () => {
    if (!isSaved) return;
    onPresentationScreen();
  };

  // update save on any var change
  useEffect(() => {
    setCanSave(false);
  }, [imgWInput, imgHInput, mediaPaths, nResInput, nResInput, responses]);

  //// styles
  const inputBoxStyles = "flex justify-between gap-8 mb-4";
  const inputTitleStyles = "py-1";
  const divider = "w-full h-px bg-gray-300";

  return (
    <>
      <div className="flex flex-col w-dvw h-dvh items-center gap-8 overflow-x-hidden">
        <h2 className="mt-8 text-2xl font-semibold">StimEval Configuration</h2>
        <div className="flex flex-col my-4 p-4 w-7/10 h-full gap-8">
          <div
            className="flex items-center gap-2 cursor-pointer font-semibold text-xl"
            onClick={onMainScreen}
          >
            <LeftArrow className="w-4 h-4 text-gray-800" />
            <p>Return to Menu</p>
          </div>
          <div className={inputBoxStyles}>
            {/* Screen bg color */}
            <div>
              <h3 className={inputTitleStyles}>Background Screen Color</h3>
              <input
                type="color"
                id="bgColor"
                name="bgColor"
                className="w-8 h-8 p-0 bg-transparent border-none shadow-none"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  setCanSave(false);
                }}
              />
            </div>
            {/* Image w and h */}
            <div>
              <h3 className={inputTitleStyles}>Stimuli Width</h3>
              <input
                type="number"
                id="imgWidth"
                name="imgWidth"
                className="w-20"
                value={imgWInput}
                onChange={handleWidthChange}
              />
            </div>
            <div>
              <h3 className={inputTitleStyles}>Stimuli Height</h3>
              <input
                type="number"
                id="imgHeight"
                name="imgHeight"
                className="w-20"
                value={imgHInput}
                onChange={handleHeightChange}
              />
            </div>
          </div>

          <div className={divider} />

          {/* Allowed responses to imgs */}
          <div className={`${inputBoxStyles} flex-col`}>
            <div>
              <h3 className={inputTitleStyles}>
                Amount of Responses to Stimuli
              </h3>
              <input
                type="number"
                id="nRes"
                name="nRes"
                className="w-20"
                min={1}
                value={nResInput}
                onChange={handleNResChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {responses.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Response group name (e.g. valence)"
                    className="border rounded p-1"
                    value={group.name}
                    onChange={(e) => handleNameChange(gi, e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Number of responses"
                    className="border rounded p-1 w-16"
                    value={group.n}
                    onChange={(e) => handleNChange(gi, e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {group.res.map((r, ri) => (
                    <input
                      key={ri}
                      type="text"
                      className="border rounded p-1 w-40 xl:w-60"
                      placeholder={`Response ${ri + 1}`}
                      value={r}
                      onChange={(e) => handleResChange(gi, ri, e.target.value)}
                    />
                  ))}
                </div>
                <div className={divider} />
              </div>
            ))}
          </div>

          {/* Images paths */}
          <div className={`${inputBoxStyles} flex-col`}>
            <div className="flex gap-8">
              <div>
                <h3 className={inputTitleStyles}>Stimuli</h3>
                <div className="flex flex-row gap-4 h-fit items-center">
                  <button
                    onClick={selectFiles}
                    className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
                  >
                    Select Stimuli
                  </button>
                  <h3 className="ml-4">Randomize</h3>
                  <input
                    type="checkbox"
                    checked={randomize}
                    onChange={() => {
                      setRandomize((prev) => !prev);
                      setCanSave(false);
                    }}
                    className="w-6 h-6 rounded-md shadow-none accent-blue-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <textarea
                className="sm:w-100 lg:w-200 min-h-25 max-h-40 p-2 border border-gray-300 rounded-md resize-y"
                placeholder="No media selected"
                value={mediaPaths
                  .map((path) => path.split(/[/\\]/).pop()) // split by / or \ and take last part
                  .join("\n")}
                readOnly
              />
              {mediaPaths.length > 0 ? (
                <button
                  className="w-fit p-2 border border-red-400 text-red-600 rounded-md cursor-pointer"
                  onClick={() => {
                    setMediaPaths([]);
                    setMediaTypes([]);
                  }}
                >
                  Clear Selected Media
                </button>
              ) : (
                <div className="w-1 h-10.5" />
              )}
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex justify-center gap-8 pb-8">
            <button
              className="w-fit px-8 py-1 border rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer"
              onClick={handlePreview}
            >
              Preview
            </button>
            <button
              className="w-fit px-8 py-1 border rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-200"
              onClick={handleSave}
              disabled={!canSave}
            >
              Save
            </button>
            <button
              className="w-fit px-8 py-1 border rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-200"
              disabled={!isSaved}
              onClick={handleRun}
            >
              Run
            </button>
          </div>
        </div>
      </div>
      {isPreviewVisible && (
        <ShowPreview
          onAccept={() => {
            setIsPreviewVisible(false);
            setCanSave(true);
          }}
          onCancel={() => {
            setIsPreviewVisible(false);
            setCanSave(false);
          }}
          data={savedConfig}
        />
      )}
    </>
  );
};

export default ConfigScreen;
