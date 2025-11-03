import { useEffect, useState } from "react";
import { loadMedia, type ConfigData } from "./ConfigManager";
import Loader from "./Loader";

interface ShowPreviewProps {
  onAccept: () => void;
  onCancel: () => void;
  data: ConfigData | null;
}

const ShowPreview = ({ onAccept, onCancel, data }: ShowPreviewProps) => {
  if (!data) return;

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showEnd, setShowEnd] = useState<boolean>(false);
  const [media, setMedia] = useState<string[]>([]);
  const [mediaIdx, setMediaIdx] = useState<number>(0);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  useEffect(() => {
    const loadPreview = async () => {
      const paths = data.mediapaths;
      let shuffledPaths = paths;

      if (data.rand) {
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
        shuffledPaths.map((p) => loadMedia(p))
      );

      setMedia(loadedImages);
      setIsLoaded(true);
    };

    loadPreview();
  }, [data]);

  const handleResponseClick = async () => {
    // move to next group
    const nextGroup = currentGroupIndex + 1;

    if (nextGroup < data.responses.length) {
      setCurrentGroupIndex(nextGroup);
    } else {
      // finished all groups for this image
      const nextImg = mediaIdx + 1;
      if (nextImg < data.mediapaths.length) {
        setMediaIdx(nextImg);
        setCurrentGroupIndex(0);
      } else {
        setShowEnd(true);
      }
    }
  };

  // styles
  const buttonStyle =
    "w-50 px-8 py-1 border rounded-md bg-blue-200 hover:bg-blue-300 font-medium cursor-pointer";
  const optButtonStyle =
    "text-sm font-medium bg-gray-50 border rounded-md px-2 py-0 cursor-pointer hover:bg-gray-200";

  console.log(media[mediaIdx]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      {isLoaded ? (
        !showEnd ? (
          <div
            className="relative w-screen h-screen overflow-clip"
            style={{
              backgroundColor: data.bgcolor,
              width: "100dvw",
              height: "100dvh",
            }}
          >
            {data && mediaIdx < data.mediapaths.length ? (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ width: data.imgw, height: data.imgh }}
              >
                {data.mediatypes[mediaIdx] === "img" ? (
                  <img
                    className="size-full object-contain"
                    src={media[mediaIdx]}
                  />
                ) : data.mediatypes[mediaIdx] === "vid" ? (
                  <video
                    className="size-full object-contain"
                    src={media[mediaIdx]}
                    autoPlay
                  />
                ) : (
                  <audio className="size-full" src={media[mediaIdx]} autoPlay />
                )}
              </div>
            ) : (
              <Loader />
            )}
            <div className="flex flex-col absolute bottom-8 left-1/2 transform -translate-x-1/2 justify-center w-4/5 gap-8">
              <div className="flex w-full justify-center text-2xl font-semibold">
                {data.responses[currentGroupIndex].name}
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 w-full justify-items-center">
                {mediaIdx < data.mediapaths.length &&
                  data.responses[currentGroupIndex].res.map((r, i) => (
                    <button
                      key={i}
                      className={buttonStyle}
                      onClick={handleResponseClick}
                    >
                      {r}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-lg font-semibold">
            Preview Completed. To proceed click accept or cancel.
          </div>
        )
      ) : (
        <Loader />
      )}
      <div className="absolute flex w-dvw bg-gray-900/10 bottom-0 left-0 scale-z-100 justify-end px-4 py-0.5 gap-4">
        <button className={optButtonStyle} onClick={onAccept}>
          Accept
        </button>
        <button className={optButtonStyle} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShowPreview;
