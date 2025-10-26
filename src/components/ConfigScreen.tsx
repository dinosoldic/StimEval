import { useState } from "react";

const ConfigScreen = () => {
  const [bgColor, setBgColor] = useState("#ffffff"); // color
  const [imgW, setImgW] = useState(500); // width of image (px)
  const [imgH, setImgH] = useState(500); // height of image (px)
  const [nRes, setNRes] = useState(3); // n of possible responses
  const [responses, setResponses] = useState<string[]>(Array(nRes).fill("")); // array to store response texts

  //// handle change of w and h
  // temporary string state for controlled input
  const [imgWInput, setImgWInput] = useState(imgW.toString());
  const [imgHInput, setImgHInput] = useState(imgH.toString());
  const [resInput, setResInput] = useState(nRes.toString());

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

  const handleNResChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setResInput(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setNRes(num);

      // resize responses array dynamically
      setResponses((prev) => {
        if (num > prev.length)
          return [...prev, ...Array(num - prev.length).fill("")];
        else return prev.slice(0, num);
      });
    }
  };

  const handleResponseChange = (index: number, value: string) => {
    setResponses((prev) => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };

  //// styles
  const inputBoxStyles = "flex justify-between gap-8 mb-4";
  const inputTitleStyles = "py-1";
  const divider = "w-full h-px bg-gray-300";

  return (
    <div className="flex flex-col w-dvw h-dvh items-center gap-8">
      <h2 className="mt-8 text-2xl font-medium">EvalEmo Configuration</h2>
      <div className="flex flex-col my-4 p-4 w-7/10 h-full gap-8">
        <div className={inputBoxStyles}>
          {/* Screen bg color */}
          <div>
            <h3 className={inputTitleStyles}>Background Color</h3>
            <input
              type="color"
              id="bgColor"
              name="bgColor"
              className="w-8 h-8 p-0 bg-transparent border-none shadow-none rounded-2xl"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
          {/* Image w and h */}
          <div>
            <h3 className={inputTitleStyles}>Stimulus Image Width</h3>
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
            <h3 className={inputTitleStyles}>Stimulus Image Height</h3>
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
            <h3 className={inputTitleStyles}>Amount of Responses</h3>
            <input
              type="number"
              id="nRes"
              name="nRes"
              className="w-20"
              value={resInput}
              onChange={handleNResChange}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {responses.map((resp, i) => (
              <input
                key={i}
                type="text"
                id={`Response ${i + 1}`}
                name={`Response ${i + 1}`}
                className="border rounded p-1 w-60"
                placeholder={`Response ${i + 1}`}
                value={resp}
                onChange={(e) => handleResponseChange(i, e.target.value)}
              />
            ))}
          </div>
        </div>

        <div className={divider} />

        {/* Images paths */}
        <div className={`${inputBoxStyles} flex-col`}>
          <div>
            <h3 className={inputTitleStyles}>Amount of Responses</h3>
            <input
              type="file"
              id="imgPaths"
              name="imgPaths"
              accept="image/*"
              multiple
              className="w-60"
            />
          </div>
          <textarea
            className="w-200 min-h-20 max-h-40 p-2 border border-gray-300 rounded-md resize-y"
            placeholder="No images selected"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigScreen;
